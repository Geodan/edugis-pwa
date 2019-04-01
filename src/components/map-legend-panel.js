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
      legendurl: String,
      zoom: Number,
      maplayer: Object,
      updatecount: Number
    }; 
  }
  constructor() {
      super();
  }
  rasterLegend()
  {
    if (this.maplayer.metadata && this.maplayer.metadata.legendurl) {
      return html`<img src="${this.maplayer.metadata.legendurl}">`;
    }
  }
  lineLegend() {
    const widthResult = {propertyname: "", items: []};
    const colorResult = {propertyname: "", items: []};
    let lineColor = "gray";
    let lineWidth = 1;
      
    if (this.maplayer._paint) {
      if (this.maplayer._paint._values) {
        const values = this.maplayer._paint._values;
        if (values["line-color"]) {
          if (values["line-color"].value.kind === "constant") {
            const rgba = values["line-color"].value.value;
            lineColor = `rgba(${rgba.r * 255},${rgba.g * 255},${rgba.b * 255},${rgba.a})`;
            colorResult.items.push({lineColor: lineColor, width: 2, label: ''});
          } else if (values["line-color"].value.kind === "source") {
            colorResult.items = values["line-color"].value._styleExpression.expression.outputs
              .map(output=>`rgba(${output.value.r * 255}, ${output.value.g * 255}, ${output.value.b * 255}, ${output.value.a})`)
              .map((color, index)=>{return {lineColor:color, width: 2, label: values["line-color"].value._styleExpression.expression.labels[index]}})
          }
        }
        if (values["line-width"]) {
          if (values["line-width"].value.kind === "constant") {
            const lineWidth = values['line-width'].value.value;
            widthResult.items.push({lineWidth: lineWidth, lineColor: colorResult.items.length == 1 ? colorResult.items[0].lineColor: colorResult.items[Math.floor(colorResult.items.length/2)].lineColor, label: ''});
          } else {
            if (values["line-width"].value.kind === "source") {
              widthResult.items = values["line-width"].value._styleExpression.expression.outputs
              .map(output=>output.value)
              .map((width, index)=>{return {lineWidth:width, lineColor: colorResult.items.length == 1 ? colorResult.items[0].lineColor: colorResult.items[Math.floor(colorResult.items.length / 2)].lineColor, label: values["line-width"].value._styleExpression.expression.labels[index]}})
            }
          }
        }
        colorResult.items = colorResult.items.map(item=>{
          item.width = widthResult.items.length == 1 ? widthResult.items[0].lineWidth : widthResult.items[Math.floor(widthResult.items.length / 2)].lineWidth;
          return item;
        });
        if (colorResult.items.length > 1 && widthResult.items.length > 1) {
          return html`
          <style>
            .twocolumn {
              display: flex;
              justify-content: space-between;
            }
          </style> 
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
          <div>${colorResult.items.map(color=>{
            return svg`<svg width="30" height="15">
            <line x1="0" y1="15" x2="30" y2="0" style="stroke:${color.lineColor};stroke-width:${color.width};" />
            </svg>${html` ${color.label}<br>`}`
          })}</div>`
        }
        return html`
          <div>${widthResult.items.map(width=>{
            return svg`<svg width="30" height="15">
            <line x1="0" y1="15" x2="30" y2="0" style="stroke:${width.lineColor};stroke-width:${width.lineWidth};" />
            </svg>${html` ${width.label}<br>`}`
          })}</div>`
      }
    } else {
      const paint = this.maplayer.paint;
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
  circleColorLegend(colorInfo, strokeInfo, radiusInfo) {
    return colorInfo.items.map(color=>
      html`
        ${svg`
        <svg width="${radiusInfo.items[0].value*2+2}" height="${radiusInfo.items[0].value*2+2}">
          <circle cx="${radiusInfo.items[0].value+1}" cy="${radiusInfo.items[0].value+1}" r="${radiusInfo.items[0].value}" style="fill:${color.value};${strokeInfo.items.length?'stroke-width:1;stroke:strokeInfo.items[0].value':''}" />
        </svg> 
        `}
        ${color.label}<br>
        `
      );
  }
  circleLegend() {
    const paint = this.maplayer.metadata.paint ? this.maplayer.metadata.paint : this.maplayer.paint;
    let colorInfo = {propertyname: this.maplayer.metadata.title, items: ['white'] };
    if (paint && paint['circle-color']) {
      colorInfo = mbStyleParser.getZoomDependentPropertyInfo(this.zoom, paint['circle-color'], this.maplayer.metadata.title);
    }
    let radiusInfo = {propertyname: this.maplayer.metadata.title, items: [5]};
    if (paint && paint['circle-radius']) {
      radiusInfo = mbStyleParser.getZoomDependentPropertyInfo(this.zoom, paint['circle-radius'], this.maplayer.metadata.title);
    }
    let strokeInfo = {propertyname: this.maplayer.metadata.title, items: []};
    if (paint && paint['circle-stroke-color']) {
      strokeInfo = mbStyleParser.getZoomDependentPropertyInfo(this.zoom, paint['circle-stroke-color'], this.maplayer.metadata.title);
      if (strokeInfo.items.length > 1) {
        // not supported
        strokeInfo.items = [];
      }
    }
    
    return html`
      ${this.circleColorLegend(colorInfo, strokeInfo, radiusInfo)}
      ${this.circleRadiusLegend(radiusInfo)}
    `
  }
  
  fillLegend()
  {
    // legend should have one or more items
    // single item if:
    // legend value is string OR legend value is zoom dependent string
    // convert to array of {propertyname, [{fillColor, outlineColor, label}]}
    
    const result = {propertyname: "", items: []};
    const paint = this.maplayer.metadata.paint ? this.maplayer.metadata.paint : this.maplayer.paint;
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
    if (Array.isArray(paintFillColor) && paintFillColor.length) {
      switch(paintFillColor[0]) {
        case "step":
          // element[1] is ["get", "propertyname"] (?)
          result.propertyname = paintFillColor[1][1];
          result.items.push({fillColor: paintFillColor[2], outlineColor: outlineColor, label: `< ${paintFillColor[3]}`});
          for (let i = 3; i < paintFillColor.length - 2; i+=2) {
            // get color
            result.items.push({fillColor: paintFillColor[i+1], outlineColor: outlineColor, label: `[${paintFillColor[i]} - ${paintFillColor[i+2]})`});
          }
          result.items.push({fillColor: paintFillColor[paintFillColor.length - 1], outlineColor, label: `> ${paintFillColor[paintFillColor.length - 2]}`})
          break;
        case "match":
          // element[1] is ["get", "propertyname"] (?)
          result.propertyname = paintFillColor[1][1];
          result.items.push({fillColor: paintFillColor[paintFillColor.length - 1], outlineColor: outlineColor, label: ''});
          for (let i = 2; i < paintFillColor.length - 1; i+=2) {
            result.items.push({fillColor: paintFillColor[i+1], outlineColor: outlineColor, label: `${paintFillColor[i]}`});
          }
      }
    } else if (paintFillColor === Object(paintFillColor)) {
      if (paintFillColor.hasOwnProperty('property')) {
        result.propertyname = paintFillColor.property;
        if (paintFillColor.stops) {
          result.items = paintFillColor.stops.map(stop=>{return {fillColor:stop[1], outlineColor: outlineColor, label: stop[0]}});
        }
      }
    } else if (typeof paintFillColor === "string") {
      result.propertyname = '';
      result.items.push({fillColor: paintFillColor, outlineColor: outlineColor, label: this.maplayer.metadata.title});
    }
    
    return html`${result.propertyname?html` ${result.propertyname}<br>`:''}
      ${result.items.map((item)=>{
        return svg`
        <svg width="30" height="15">
          <rect width="30" height="15" style="fill:${item.fillColor};stroke-width:1;stroke:${item.outlineColor}"/>
        </svg>${html` ${item.label}<br>`}`;
      })}`;
  }
  render()
  {
    let legendContent = html`legenda niet beschikbaar`;
    if (this.maplayer && this.maplayer.type) {
      switch(this.maplayer.type) {
        case 'raster':
          legendContent = this.rasterLegend();
          break;
        case 'fill':
          legendContent = this.fillLegend();
          break;
        case 'line':
          legendContent = this.lineLegend();
          break;
        case 'circle':
          legendContent = this.circleLegend();
          break;
        default:
          legendContent = html`legend not available for type ${this.maplayer.type}</div>`;
      }
    }
    let legendopacity;
    if (this.maplayer.metadata.hasOwnProperty("opacity")) {
      legendopacity = `opacity: ${this.maplayer.metadata.opacity / 100.0};`
    }

    return html`
      <style>
        .legendcontainer {
          text-align: left;
          padding-left: 5px;
          background: white;
          overflow: hidden;
        }
        .legendcontainer img {
          max-width: calc(100% - 3px);
        }
      </style>
      <div class="legendcontainer" style="${legendopacity?legendopacity:''}">${legendContent}</div>`;
  }
}

customElements.define('map-legend-panel', MapLegendPanel);