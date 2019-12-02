/* map-legend-panel
   Visual container that displays the layer legend or a message that no legend is available.
   If the layer style is editable, this container also provides buttons to access layer-legend edit dialogs
*/

import {LitElement, html, svg} from 'lit-element';
import '../utils/mbox-style-parse.js';
import mbStyleParser from '../utils/mbox-style-parse.js';

/**
* @polymer
* @extends HTMLElement
*/
class MapLegendPanel extends LitElement {
  static get properties() { 
    return { 
      legendurl: {type: String},
      zoom: {type: Number},
      maplayer: {type: Object},
      transparency: {type: Number},
      updatelegend: { type: Number}
    }; 
  }
  constructor() {
      super();
      this.transparency = 0;
      this.updatelegend = 0;
  }
  shouldUpdate(changedProperties) {
    if (changedProperties.has('maplayer')) {
      if (this.maplayer && this.maplayer.metadata && this.maplayer.hasOwnProperty('transparency')) {
        this.transparency = this.maplayer.metadata.transparency;
      } else {
        this.transparency = 0;
      }
    }
    return true;
  }
  _legendReady() {
    this.dispatchEvent(new CustomEvent('load', {}));
  }
  rasterLegend(maplayer)
  {
    if (maplayer.metadata && maplayer.metadata.legendurl) {
      return html`<img @load="${()=>this._legendReady()}" src="${maplayer.metadata.legendurl}">`;
    }
  }
  lineLegend(maplayer) {
    let layerTitle = maplayer.metadata.title?maplayer.metadata.title:maplayer.id;
    const widthResult = {propertyname: layerTitle, items: []};
    const colorResult = {propertyname: layerTitle, items: []};
    let lineColor = "gray";
    let lineWidth = 1;
    if (maplayer._paint) {
      if (maplayer._paint._values) {
        const values = maplayer._paint._values;
        if (values["line-color"]) {
          if (values["line-color"].value.kind === "constant") {
            const rgba = values["line-color"].value.value;
            lineColor = `rgba(${rgba.r * 255},${rgba.g * 255},${rgba.b * 255},${rgba.a})`;
            colorResult.items.push({lineColor: lineColor, width: 2, label: layerTitle});
          } else if (values["line-color"].value.kind === "source") {
            colorResult.items = values["line-color"].value._styleExpression.expression.outputs
              .map(output=>`rgba(${output.value.r * 255}, ${output.value.g * 255}, ${output.value.b * 255}, ${output.value.a})`)
              .map((color, index)=>{
                let expression = values["line-color"].value._styleExpression.expression;
                return {lineColor:color, width: 2, label: expression.labels?expression.labels[index]:expression.cases?Object.keys(expression.cases)[index]:'unknown'}
              })
          }
        }
        if (values["line-width"]) {
          if (values["line-width"].value.kind === "constant") {
            const lineWidth = values['line-width'].value.value;
            widthResult.items.push({
              lineWidth: lineWidth, 
              lineColor: colorResult.items.length == 1 ? colorResult.items[0].lineColor: colorResult.items[Math.floor(colorResult.items.length/2)].lineColor, 
              label: layerTitle
            });
          } else {
            if (values["line-width"].value.kind === "source") {
              widthResult.items = values["line-width"].value._styleExpression.expression.outputs
              .map(output=>output.value)
              .map((width, index)=>{                
                let expression = values["line-width"].value._styleExpression.expression;
                return {
                    lineWidth:width, 
                    lineColor: colorResult.items.length == 1 ? colorResult.items[0].lineColor: colorResult.items[Math.floor(colorResult.items.length / 2)].lineColor, 
                    label: expression.labels? expression.labels[index] : expression.cases?Object.keys(expression.cases)[index]: 'unknown'
                  }
              })
            }
          }
        }
        colorResult.items = colorResult.items.map(item=>{
          item.width = widthResult.items.length == 1 ? widthResult.items[0].lineWidth : widthResult.items[Math.floor(widthResult.items.length / 2)].lineWidth;
          return item;
        });
        if (colorResult.items.length == 1) {
          // only one legend item in layer
          if (colorResult.items[0].label === '') {
            colorResult.items[0].label = colorResult.propertyname;
          }
          colorResult.propertyname = null;
        }
        if (widthResult.items.length == 1) {
          // only one legend item in layer
          if (widthResult.items[0].label === '') {
            widthResult.items[0].label = widthResult.propertyname;
          }
          widthResult.propertyname = null;
        }
        if (colorResult.items.length > 1 && widthResult.items.length > 1) {
          return html`
          <style>
            .twocolumn {
              display: flex;
              justify-content: space-between;
            }
          </style> 
          ${colorResult.propertyname?html` ${colorResult.propertyname}<br>`:''}
          <div class="twocolumn">
          <div>${colorResult.items.map(color=>{
            return svg`<svg width="30" height="15">
            <line x1="0" y1="15" x2="30" y2="0" style="stroke:${color.lineColor};stroke-width:${color.width};" />
            </svg>${html` ${color.label}<br>`}`
          })}</div>
          <div>${widthResult.items.map(width=>{
            return svg`<svg width="30" height="15">
            <line x1="0" y1="15" x2="30" y2="0" style="stroke:${width.lineColor};stroke-width:${width.lineWidth};" />
            </svg>${html` ${width.label}<br>`}`
          })}</div>
          </div>`
        }
        if (colorResult.items.length > 1) {
          return html`
          <div>${colorResult.propertyname?html` ${colorResult.propertyname}<br>`:''}
          ${colorResult.items.map(color=>{
            return svg`<svg width="30" height="15">
            <line x1="0" y1="15" x2="30" y2="0" style="stroke:${color.lineColor};stroke-width:${color.width};" />
            </svg>${html` ${color.label}<br>`}`
          })}</div>`
        }
        return html`
          <div>
          ${widthResult.propertyname?html` ${widthResult.propertyname}<br>`:''}
          ${widthResult.items.map(width=>{
            return svg`<svg width="30" height="15">
            <line x1="0" y1="15" x2="30" y2="0" style="stroke:${width.lineColor};stroke-width:${width.lineWidth};" />
            </svg>${html` ${width.label}<br>`}`
          })}</div>`
      }
    } else {
      const paint = maplayer.paint;
      if (paint && paint['line-color']) {
        lineColor = paint['line-color'];
      }
      if (paint && paint['line-width']) {
        lineWidth = paint['line-width'];
      }
      if (lineWidth === Object(lineWidth)) {
        if (lineWidth.stops) {
          let minWidth = 1;
          let maxWidth = 1;
          let prevZoom = 0;
          for (let i = 0; i < lineWidth.stops.length; i++) {
            if (this.zoom <= lineWidth.stops[i][0]) {
              maxWidth = lineWidth.stops[i][1];
              lineWidth = (maxWidth - minWidth) * (this.zoom - prevZoom)/(lineWidth.stops[i][0] - prevZoom);
              break;
            } else {
              minWidth = lineWidth.stops[i][1];
              prevZoom = lineWidth.stops[i][0];
            }
          }
        }
      }
      if (Array.isArray(lineWidth)) {

      }
    }
    if (!Array.isArray(lineColor)) {
      lineColor = [lineColor];
    }
    return svg`${lineColor.map((color, index)=>{
        return svg`<svg width="30" height="15">
        <line x1="0" y1="15" x2="30" y2="0" style="stroke:${color};stroke-width:${lineWidth};" />
        </svg>`;
      })}`
  }

  circleRadiusLegend(radiusInfo) {
    if (radiusInfo.items.length > 1) {
      return radiusInfo.items.map(radius=>
          svg`
            <svg width="${radiusInfo.items[0].value*2+2}" height="${radiusInfo.items[0].value*2+2}">
            <circle cx="${radiusInfo.items[0].value+1}" cy="${radiusInfo.items[0].value+1}" r="${radiusInfo.items[0].value}" style="fill:red;" />
            </svg>
          `
        );
    }
  }
  circleColorLegend(colorInfo, strokeInfo, radiusInfo, opacityInfo) {
    return html`${colorInfo.propertyname?html` ${colorInfo.propertyname}<br>`:''}
      ${colorInfo.items.map(color=>
      html`
        ${svg`
        <svg width="${radiusInfo.items[0].value*2+2}" height="${radiusInfo.items[0].value*2+2}">
          <circle cx="${radiusInfo.items[0].value+1}" cy="${radiusInfo.items[0].value+1}" r="${radiusInfo.items[0].value}" style="fill:${color.value};${opacityInfo.items.length?`fill-opacity:${opacityInfo.items[0].value};`:''}${strokeInfo.items.length?`stroke-width:1;stroke:${strokeInfo.items[0].value}`:''}" />
        </svg> 
        `}
        ${color.label}<br>
        `
      )}`;
  }
  circleLegend(maplayer) {
    const paint = maplayer.metadata.paint ? maplayer.metadata.paint : maplayer.paint;
    let colorInfo = {propertyname: maplayer.metadata.title, items: ['white'] };
    if (paint && paint['circle-color']) {
      colorInfo = mbStyleParser.getZoomDependentPropertyInfo(this.zoom, paint['circle-color'], maplayer.metadata.title);
    }
    let opacityInfo = {propertyname: maplayer.metadata.title, items: []};
    if (paint && paint['circle-opacity']) {
      opacityInfo = mbStyleParser.getZoomDependentPropertyInfo(this.zoom, paint['circle-opacity'], maplayer.metadata.title);
      if (opacityInfo.items.length > 1) {
        // not supported
        opacityInfo.items = [];
      }
    }
    let radiusInfo = {propertyname: maplayer.metadata.title, items: [{value:5}]};
    if (paint && paint['circle-radius']) {
      radiusInfo = mbStyleParser.getZoomDependentPropertyInfo(this.zoom, paint['circle-radius'], maplayer.metadata.title);
    }
    let strokeInfo = {propertyname: maplayer.metadata.title, items: []};
    if (paint && paint['circle-stroke-color'] && paint['circle-stroke-width']) {
      strokeInfo = mbStyleParser.getZoomDependentPropertyInfo(this.zoom, paint['circle-stroke-color'], maplayer.metadata.title);
      if (strokeInfo.items.length > 1) {
        // not supported
        strokeInfo.items = [];
      }
    }
    
    return html`
      ${this.circleColorLegend(colorInfo, strokeInfo, radiusInfo, opacityInfo)}
      ${this.circleRadiusLegend(radiusInfo)}
    `
  }
  
  filleExtrusionLegend(maplayer) {
    let layerTitle = maplayer.metadata.title?maplayer.metadata.title:maplayer.id;
    const result = {propertyname: layerTitle, items: []};
    const paint = maplayer.metadata.paint ? maplayer.metadata.paint : maplayer.paint;
    let paintFillColor;
    if (paint && paint['fill-extrusion-color']) {
      paintFillColor = mbStyleParser.getZoomDependentValue(this.zoom, paint['fill-extrusion-color']);
    }
    if (Array.isArray(paintFillColor) && paintFillColor.length) {
      switch(paintFillColor[0]) {
        case "step":
          // element[1] is ["get", "propertyname"] (?)
          result.propertyname = mbStyleParser.searchPaintForProperty(paintFillColor);
          result.items.push({fillColor: paintFillColor[2], label: `< ${paintFillColor[3]}`});
          for (let i = 3; i < paintFillColor.length - 2; i+=2) {
            // get color
            result.items.push({fillColor: paintFillColor[i+1], label: `[${paintFillColor[i]} - ${paintFillColor[i+2]})`});
          }
          result.items.push({fillColor: paintFillColor[paintFillColor.length - 1], label: `> ${paintFillColor[paintFillColor.length - 2]}`})
          break;
        case "match":
          // element[1] is ["get", "propertyname"] (?)
          result.propertyname = mbStyleParser.searchPaintForProperty(paintFillColor);
          result.items.push({fillColor: paintFillColor[paintFillColor.length - 1], label: ''});
          for (let i = 2; i < paintFillColor.length - 1; i+=2) {
            result.items.push({fillColor: paintFillColor[i+1], label: `${paintFillColor[i]}`});
          }
          break;
        case "case":
          result.propertyname = mbStyleParser.searchPaintForProperty(paintFillColor);
          result.items.push({fillColor: paintFillColor[paintFillColor.length - 1], label: ''});
          for (let i = 1; i < paintFillColor.length - 1; i+=2) {
            result.items.push({fillColor: paintFillColor[i+1], label: `${paintFillColor[i][2]}`});
          }
          break;
      }
    } else if (paintFillColor === Object(paintFillColor)) {
      if (paintFillColor.hasOwnProperty('property')) {
        result.propertyname = paintFillColor.property;
        if (paintFillColor.stops) {
          result.items = paintFillColor.stops.map(stop=>{return {fillColor:stop[1], label: stop[0]}});
        }
      }
    } else if (typeof paintFillColor === "string") {
      result.propertyname = '';
      result.items.push({fillColor: paintFillColor, label: layerTitle});
    }
    if (result.items.length == 1) {
      // only one legend item in layer
      if (result.items[0].label === '') {
        result.items[0].label = result.propertyname;
      }
      result.propertyname = null;
    }
    return html`${result.propertyname?html` ${result.propertyname}<br>`:''}
      ${result.items.map((item)=>{
        return svg`
        <svg width="30" height="15">
          <rect width="30" height="15" style="fill:${item.fillColor};fill-opacity:1;stroke-width:1;stroke:#cccccc"/>
        </svg>${html` ${item.label}<br>`}`;
      })}`;
  }
  fillLegend(maplayer)
  {
    // legend should have one or more items
    // single item if:
    // legend value is string OR legend value is zoom dependent string
    // convert to array of {propertyname, [{fillColor, outlineColor, label}]}
    let layerTitle = maplayer.metadata.title?maplayer.metadata.title:maplayer.id;
    const result = {propertyname: layerTitle, items: []};
    const paint = maplayer.metadata.paint ? maplayer.metadata.paint : maplayer.paint;
    let paintFillColor = "white";
    if (paint && paint['fill-color']) {
      paintFillColor = mbStyleParser.getZoomDependentValue(this.zoom, paint['fill-color']);
    }
    let outlineColor = "gray";
    if (paint && paint['fill-outline-color']) {
      outlineColor = mbStyleParser.getZoomDependentValue(this.zoom, paint['fill-outline-color']);
    }
    // todo: get more complex outlinecolor if applicable
    if (typeof outlineColor !== 'string') {
      outlineColor = "gray";
    }
    let fillOpacity = 1;
    if (paint && paint['fill-opacity']) {
      fillOpacity = mbStyleParser.getZoomDependentValue(this.zoom, paint['fill-opacity']);
    }
    if (typeof fillOpacity !== 'number') {
      fillOpacity = 1;
    }
    if (Array.isArray(paintFillColor) && paintFillColor.length) {
      switch(paintFillColor[0]) {
        case "step":
          // element[1] is ["get", "propertyname"] (?)
          result.propertyname = mbStyleParser.searchPaintForProperty(paintFillColor);
          result.items.push({fillColor: paintFillColor[2], outlineColor: outlineColor, fillOpacity: fillOpacity, label: `< ${paintFillColor[3]}`});
          for (let i = 3; i < paintFillColor.length - 2; i+=2) {
            // get color
            result.items.push({fillColor: paintFillColor[i+1], outlineColor: outlineColor, fillOpacity: fillOpacity, label: `[${paintFillColor[i]} - ${paintFillColor[i+2]})`});
          }
          result.items.push({fillColor: paintFillColor[paintFillColor.length - 1], outlineColor, fillOpacity: fillOpacity, label: `> ${paintFillColor[paintFillColor.length - 2]}`})
          break;
        case "match":
          // element[1] is ["get", "propertyname"] (?)
          result.propertyname = mbStyleParser.searchPaintForProperty(paintFillColor);
          result.items.push({fillColor: paintFillColor[paintFillColor.length - 1], outlineColor: outlineColor, fillOpacity: fillOpacity, label: ''});
          for (let i = 2; i < paintFillColor.length - 1; i+=2) {
            result.items.push({fillColor: paintFillColor[i+1], outlineColor: outlineColor, fillOpacity: fillOpacity, label: `${paintFillColor[i]}`});
          }
          break;
        case "case":
          result.propertyname = mbStyleParser.searchPaintForProperty(paintFillColor);
          result.items.push({fillColor: paintFillColor[paintFillColor.length - 1], outlineColor: outlineColor, fillOpacity: fillOpacity, label: ''});
          for (let i = 1; i < paintFillColor.length - 1; i+=2) {
            result.items.push({fillColor: paintFillColor[i+1], outlineColor: outlineColor, fillOpacity: fillOpacity, label: `${paintFillColor[i][2]}`});
          }
          break;
      }
    } else if (paintFillColor === Object(paintFillColor)) {
      if (paintFillColor.hasOwnProperty('property')) {
        result.propertyname = paintFillColor.property;
        if (paintFillColor.stops) {
          result.items = paintFillColor.stops.map(stop=>{return {fillColor:stop[1], outlineColor: outlineColor, fillOpacity: fillOpacity, label: stop[0]}});
        }
      }
    } else if (typeof paintFillColor === "string") {
      result.propertyname = '';
      result.items.push({fillColor: paintFillColor, outlineColor: outlineColor, label: layerTitle});
    }
    if (result.items.length == 1) {
      // only one legend item in layer
      if (result.items[0].label === '') {
        result.items[0].label = result.propertyname;
      }
      result.propertyname = null;
    }
    return html`${result.propertyname?html` ${result.propertyname}<br>`:''}
      ${result.items.map((item)=>{
        return svg`
        <svg width="30" height="15">
          <rect width="30" height="15" style="fill:${item.fillColor};fill-opacity:${fillOpacity};stroke-width:1;stroke:${item.outlineColor}"/>
        </svg>${html` ${item.label}<br>`}`;
      })}`;
  }
  backgroundLegend(maplayer) {
    let bgColor = maplayer.paint["background-color"];
    let bgOpacity = maplayer.paint["background-opacity"]?maplayer.paint["background-opacity"]:1;
    return svg`
        <svg width="30" height="15">
          <rect width="30" height="15" style="fill:${bgColor};fill-opacity:${bgOpacity};stroke-width:1;stroke:black"/>
        </svg>${html` kaartachtergrond<br>`}`;
  }
  getUserLegend(maplayer) {
    let classInfo = maplayer.metadata.classInfo;
    switch(maplayer.type) {
      case 'fill':
          return classInfo.classes.map((item,index)=>{
            return svg`
              <svg width="30" height="15">
                <rect id="${maplayer.id} ${index}" width="30" height="15" style="fill:${item.paint};fill-opacity:1;stroke-width:1;stroke:#cccccc"/>
              </svg>${html` ${item.label}<br>`}`;
          })
        break;
      case 'line':
        break;
      case 'circle':
          let radius = 5;
          return classInfo.classes.map((item,index)=>{
            return svg`
              <svg width="${radius*2+2}" height="${radius*2+2}">
                <circle id="${maplayer.id} ${index}" cx="${radius+1}" cy="${radius+1}" r="${radius}" style="fill:${item.paint};fill-opacity:1;stroke-width:1;stroke:white}" />
              </svg> 
            ${item.label}<br>
            `
          })          
        break;
      default: 
        return `unsupported user layer: ${maplayer.type}`
    }
  }
  getLegendContent(maplayer) {
    let legendContent = html`legenda niet beschikbaar`;
    if (maplayer.metadata && maplayer.metadata.classInfo) {
      return this.getUserLegend(maplayer)
    }
    switch(maplayer.type) {
      case 'raster':
        legendContent = this.rasterLegend(maplayer);
        break;
      case 'fill':
        legendContent = this.fillLegend(maplayer);
        break;
      case 'fill-extrusion':
        legendContent = this.filleExtrusionLegend(maplayer);
        break;
      case 'line':
        legendContent = this.lineLegend(maplayer);
        break;
      case 'circle':
        legendContent = this.circleLegend(maplayer);
        break;
      case 'style':
        if (maplayer.metadata && maplayer.metadata.sublayers && maplayer.metadata.sublayers.length) {
          legendContent = maplayer.metadata.sublayers.map(sublayer=>this.getLegendContent(sublayer));
        }
        break;
      case 'symbol':
        legendContent = '';
        break;
      case 'background':
        legendContent = this.backgroundLegend(maplayer);
        break;
      default:
        legendContent = html`<div>legend not available for type ${maplayer.type}</div>`;
    }
    return legendContent;
  }

  render()
  {
    let legendContent;
    if (this.maplayer && this.maplayer.type) {
      legendContent = this.getLegendContent(this.maplayer);
    } 
    return html`
      <style>
        :host {
          display: inline-block;
        }
        .legendcontainer {
          text-align: left;
          padding-left: 5px;
          background: white;
          overflow: hidden;
        }
        .legendcontainer img {
          max-width: calc(100% - 3px);
        }
        .hidden {
          display: none;
        }
      </style>
      <input @change="${e=>this._updateUserColor(e)}" type="color" id="colorinput" tabindex=-1 class="hidden">
      <div @click="${e=>this._handleLegendClick(e)}" class="legendcontainer" style="opacity:${this.transparency?1-Math.round(this.transparency)/100:1};">${legendContent}</div>`;
  }
  _handleLegendClick(event) {
    if (event.target.id) {
      //let layer=event.target.id.split(' ')[0];
      this.classesIndex=parseInt(event.target.id.split(' ')[1]);
      let colorInput = this.shadowRoot.querySelector('#colorinput');
      colorInput.value = this.maplayer.metadata.classInfo.classes[this.classesIndex];
      colorInput.click();
    }
    console.log(event.target);
  }
  _updateUserColor(event) {
    //let colorInput = this.shadowRoot.querySelector('#colorinput');
    let color = event.target.value;
    this.maplayer.metadata.classInfo.classes[this.classesIndex].paint = color;
    console.log('updating color');
    this._updatePaintProperty(color);
  }
  _updatePaintProperty(color)
  {
    //console.log(e.currentTarget.value);
    let paintColor = this.maplayer.metadata.paint[`${this.maplayer.type}-color`];
    if (Array.isArray(paintColor)) {
      paintColor[(this.classesIndex + 1)*2] = color;
    } else {
      paintColor = color;
    }
    let property = {};
    property[`${this.maplayer.type}-color`] = paintColor;
    property.layerid = this.maplayer.id;
    this.dispatchEvent(new CustomEvent('changepaintproperty', {
      detail: property,
      bubbles: true,
      composed: true,
    }));
    this.updatecount++;
  }
}

customElements.define('map-legend-panel', MapLegendPanel);