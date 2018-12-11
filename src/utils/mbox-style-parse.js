import tinycolor from "../../lib/tinycolor.js";

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */

class MBStyleParser
{
  getZoomDependentValue(zoom, value) {
    let result = value;
    if (Array.isArray(value) && value.length > 4 && value[0] === "interpolate" && Array.isArray(value[2]) && value[2][0] === "zoom") {      
      for (let i = 3; i < value.length - 1; i+=2) {
        result = value[i+1];
        if (zoom < value[i]) {
          break;
        } 
      }
    } else if (value === Object(value)) {
      if (value.stops && !value.hasOwnProperty('property')) {
        for (let i = 0; i < value.stops.length; i++) {
          result = value.stops[i][1];
          if (zoom < value.stops[i][0]) {
            break;
          } 
        }        
      }
    }
    return result;
  }
  hslToRgb(h, s, l){
    var r, g, b;
  
    s = s / 100;
    l = l / 100;
    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }
  
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
  sevenCharHexColor(colorString) {
    // colorString expected to be either #xyz or #xxyyzz
    if (colorString.length === 4) {
      colorString = colorString.split('').map((char,index)=>index?char+char:char).join('');
    }
    return colorString;
  }
  colorToHex(propertyValue) {
    if (typeof propertyValue !== "string") {
      return propertyValue;
    }
    let colorString = propertyValue.replace(' ', '');
    if (colorString.startsWith('#')) {
      return this.sevenCharHexColor(colorString);
    }
    if (colorString.startsWith('hsl(')) {
      colorString = colorString.substring(4).split(',').map(value=>parseFloat(value));
      const rgb = hslToRgb(colorString[0], colorString[1], colorString[2]);
      return "#" + rgb[0].toString(16) + rgb[1].toString(16) + rgb[2].toString(16);
    }
    if (colorString.startsWith('hsla(')) {
      colorString = colorString.substring(5).split(',').map(value=>parseFloat(value));
      const rgb = hslToRgb(colorString[0], colorString[1], colorString[2]);
      return "#" + rgb[0].toString(16) + rgb[1].toString(16) + rgb[2].toString(16);
    }
    if (colorString.startsWith('rgba(')) {
      const rgb = colorString.substring(5).split(',').map(value=>parseFloat(value));
      return "#" + rgb[0].toString(16) + rgb[1].toString(16) + rgb[2].toString(16);
    }
    if (colorString.startsWith('rgb(')) {
      const rgb = colorString.substring(4).split(',').map(value=>parseFloat(value));
      return "#" + rgb[0].toString(16) + rgb[1].toString(16) + rgb[2].toString(16);
    }
    if (tinycolor.names[colorString]) {
      const hexColor = tinycolor.names[colorString];
      if (hexColor) {
        return this.sevenCharHexColor('#' + hexColor);
      }
    }
    return propertyValue;
  }
  styleArrayToItems(styleArray, paintPropertyName)
  {
    // convert mapbox paint style array to legend with items
    let result;
    if (Array.isArray(styleArray) && styleArray.length) {
      switch (styleArray[0]) {
        case "step":
          {
            // element[1] is ["get", "propertyname"]
            result = {legendTitle: styleArray[1][1], items: [], type: "seq"};
            if (typeof styleArray[3] === "string") {
              result.type = "qual"
            }
            const paintProperties = {};
            paintProperties[paintPropertyName] = this.colorToHex(styleArray[2]);
            result.items.push({paint: paintProperties, label: typeof styleArray[3] === "string" ? styleArray[3] : '< ' + styleArray[3]});
            for (let i = 3; i < styleArray.length - 2; i +=2) {
              const newProperty = {}
              newProperty[paintPropertyName] = this.colorToHex(styleArray[i+1]);
              result.items.push({paint: newProperty, label: styleArray[i] + " - " + styleArray[i+2]});
            }
            const lastProperty = {}
            lastProperty[paintPropertyName] = this.colorToHex(styleArray[styleArray.length - 1]);
            result.items.push({paint: lastProperty, label: typeof styleArray[styleArray.length - 2] === "string" ? styleArray[styleArray.length - 2] : "> " + styleArray[styleArray.length - 2]})
          }
          break;
        case "match":
          {
            // element[1] is ["get", "propertyname"] (?)
            result = {legendTitle: styleArray[1][1], items: [], type: "seq"};
            if (typeof styleArray[2] === "string") {
              result.type = "qual";
            }
            const defaultProperty = {}
            defaultProperty[paintPropertyName] = this.colorToHex(styleArray[styleArray.length - 1]);
            result.items.push({paint: defaultProperty, label: ''});
              
            for (let i = 2; i < styleArray.length - 1; i += 2) {
              const newProperty = {};
              newProperty[paintPropertyName] = this.colorToHex(styleArray[i + 1]);
              result.items.push({
                paint: newProperty,
                label: styleArray[i]
              });
            }
          }
          break;
      }
    }
    return result;
  }
  styleObjectToItems(styleObject, paintPropertyName) {
    // convert mapbox paint style object to legend with items
    let result;
    if (styleObject === Object(styleObject)) {
      if (styleObject.hasOwnProperty('property')) {
        result = {legendTitle: styleObject.property, items: [], type: "seq"};
        if (typeof styleObject.stops[0][0] === "string") {
          result.type = "qual";
        }
        result.propertyname = styleObject.property;
        if (styleObject.stops) {
          result.items = styleObject.stops.map(stop=>{
            const paint = {}
            paint[paintPropertyName] = this.colorToHex(stop[1]);
            return {paint: paint, label: stop[0]}});
        }
      }
    }
    return result;
  }
  paintStyleToLegendItems(paintStyle, legendType, zoom)
  {
    // convert mapbox paint style to legend lines
    // return {legendTitle: title, legendType: "line|fill|circle", legendItems: [{paintProperties:{}, label}]}
    let result = {legendTitle: '', legendType: legendType, legendItems: []};
    switch (legendType) {
      case "fill":
        let legend = this.styleArrayToItems(paintStyle, "fill-color");
        if (!legend) {
          // object ?
          legend = this.styleObjectToItems(paintStyle, "fill-color");
        }
        if (legend) {
          result = legend;
        }
        break;
      case "line":
        break;
      case "circle":
        break;
    }
    return result;
  }
}

const mbStyleParser = new MBStyleParser();

export default mbStyleParser;

