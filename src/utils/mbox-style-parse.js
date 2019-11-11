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
  getPropertyInfo(paintProperty, defaultLabel) {
    if (!defaultLabel) {
      defaultLabel = '';
    }
    const result = {propertyname: "", items: []};
    if (Array.isArray(paintProperty) && paintProperty.length) {
      switch(paintProperty[0]) {
        case "step":
          // element[1] is ["get", "propertyname"] (?)
          result.propertyname = paintProperty[1][1];
          result.items.push({fillColor: paintProperty[2], outlineColor: outlineColor, label: `< ${paintProperty[3]}`});
          for (let i = 3; i < paintProperty.length - 2; i+=2) {
            // get color
            result.items.push({fillColor: paintProperty[i+1], outlineColor: outlineColor, label: `[${paintProperty[i]} - ${paintProperty[i+2]})`});
          }
          result.items.push({fillColor: paintProperty[paintProperty.length - 1], outlineColor, label: `> ${paintProperty[paintProperty.length - 2]}`})
          break;
        case "match":
          // element[1] is ["get", "propertyname"] (?)
          result.propertyname = typeof paintProperty[1][1] === "string"? paintProperty[1][1]:"expressie";
          result.items.push({value: paintProperty[paintProperty.length - 1], label: ''});
          for (let i = 2; i < paintProperty.length - 1; i+=2) {
            result.items.push({value: paintProperty[i+1], label: `${paintProperty[i]}`});
          }
          break;
        case "case":
            result.propertyname = typeof paintProperty[1][1] === "string"? paintProperty[1][1]:"expressie";
            result.items.push({value: paintProperty[paintProperty.length - 1], label: ''});
            for (let i = 2; i < paintProperty.length - 1; i+=2) {
              result.items.push({value: paintProperty[i+1], label: `${paintProperty[i]}`});
            }
        break;
      }
    } else if (paintProperty === Object(paintProperty)) {
      if (paintProperty.hasOwnProperty('property')) {
        result.propertyname = paintProperty.property;
        if (paintProperty.stops) {
          result.items = paintProperty.stops.map(stop=>{return {value:stop[1], label: stop[0]}});
        }
      }
    } else {
      result.propertyname = '';
      result.items.push({value: paintProperty, label: defaultLabel});
    }
    return result;
  }
  getZoomDependentPropertyInfo(zoom, property, defaultLabel) {
    return this.getPropertyInfo(this.getZoomDependentValue(zoom, property), defaultLabel);
  }
  colorToHex(propertyValue) {
    if (typeof propertyValue !== "string") {
      return propertyValue;
    }
    const color = tinycolor(propertyValue);
    return color.toHexString();
  }
  searchPaintForProperty(paint) {
    if (Array.isArray(paint)) {
      if (paint.length === 2 && paint[0] === "get") {
        return paint[1];
      }
      return paint.reduce((result, item)=>{
        if (!result) {
          let search = this._searchPaintForProperty(item);
          if (search) {
            result = search;
          }
        }
        return result;
      }, false);
    }
    return false;
  }
  getLayerStylePropertyName(paint) {
      if (paint.property) {
        return paint.property;
      }
      if (Array.isArray(paint)) {
        if (paint[0] === "step" || paint[0] === "match") {
          if (paint[1][0] === "get") {
            return paint[1][1];
          }
        }
        if (paint[0] === "case") {
          let condition = paint[1];
          for (let item of condition) {
            if (item.length === 2 && item[0] === "get") {
              return item[1];
            }
          }
        }
        let search = this._searchPaintForProperty(paint);
        if (search) {
          return search;
        }
      }
      return undefined;
  }
  styleArrayToItems(styleArray, paintPropertyName)
  {
    // convert mapbox paint style array to legend with items
    let result;
    if (Array.isArray(styleArray) && styleArray.length) {
      let attributeName = this.getLayerStylePropertyName(styleArray);
      switch (styleArray[0]) {
        case "step":
          {
            // element[1] is ["get", "propertyname"]
            result = {legendTitle: attributeName, items: [], type: "seq", attribute: attributeName};
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
        case "case":
          {
            // element[1] is ["get", "propertyname"] (?)
            result = {legendTitle: attributeName, items: [], type: "seq", attribute: attributeName};
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
        result = {legendTitle: styleObject.property, items: [], type: "seq", attribute: styleObject.property};
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
  styleStringToItems(styleString, paintPropertyName, layerTitle) {
    let result;
    if (typeof styleString === "string") {
      let paint = {};
      paint[paintPropertyName] = this.colorToHex(styleString);
      result = {legendTitle: layerTitle, items:[{paint: paint, label: layerTitle}], attribute: layerTitle}
    }
    return result;
  }
  paintStyleToLegendItems(paintStyle, legendType, zoom, layerTitle)
  {
    // convert mapbox paint style to legend lines
    // return {legendTitle: title, legendType: "line|fill|circle", legendItems: [{paintProperties:{}, label}]}
    if (!layerTitle) {
      layerTitle = "";
    }
    let result = {legendTitle: layerTitle, legendType: legendType, items: []};

    let propertyname = `${legendType}-color`;

    let legend = this.styleArrayToItems(paintStyle, propertyname);
    if (!legend) {
      // object ?
      legend = this.styleObjectToItems(paintStyle, propertyname);
    }
    if (!legend) {
      // string?
      legend = this.styleStringToItems(paintStyle, propertyname, layerTitle);
    }
    if (legend) {
      result = legend;
    }
    return result;
  }

  propertyType(property) {
    if (Array.isArray(property)) {
      return "expression";
    }
    if (property.property) {
      return "function";
    }
    if (typeof property === "string") {
      return "string";
    }
    if (typeof property === "") {
      return "number";
    }
  }
}



const mbStyleParser = new MBStyleParser();

export default mbStyleParser;

