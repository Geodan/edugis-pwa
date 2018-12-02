/* map-legend-panel
   Visual container that displays the layer legend or a message that no legend is available.
   If the layer style is editable, this container also provides buttons to access layer-legend edit dialogs
*/

import {LitElement, html, svg} from '@polymer/lit-element';


/**
* @polymer
* @extends HTMLElement
*/
class MapLegendPanel extends LitElement {
  static get properties() { 
    return { 
      legendurl: String,
      zoom: Number,
      maplayer: Object
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
  getZoomDependentValue(value) {
    let result = value;
    if (Array.isArray(value) && value.length > 4 && value[0] === "interpolate" && Array.isArray(value[2]) && value[2][0] === "zoom") {      
      for (let i = 3; i < value.length - 1; i+=2) {
        result = value[i+1];
        if (this.zoom < value[i]) {
          break;
        } 
      }
    } else if (value === Object(value)) {
      if (value.stops && !value.hasOwnProperty('property')) {
        for (let i = 0; i < value.stops.length; i++) {
          result = value.stops[i][1];
          if (this.zoom < value.stops[i][0]) {
            break;
          } 
        }        
      }
    }
    return result;
  }
  fillLegend()
  {
    // legend should have one or more items
    // single item if:
    // legend value is string OR legend value is zoom dependent string
    // convert to array of {propertyname, [{fillColor, outlineColor, label}]}
    
    const result = {propertyname: "", items: []};
    const paint = this.maplayer.paint;
    let paintFillColor = "white";
    if (paint && paint['fill-color']) {
      paintFillColor = this.getZoomDependentValue(paint['fill-color']);
    }
    let outlineColor = "gray";
    if (paint && paint['fill-outline-color']) {
      outlineColor = this.getZoomDependentValue(paint['fill-outline-color']);
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
      result.items.push({fillColor: paintFillColor, outlineColor: outlineColor, label: ''});
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
        default:
          legendContent = html`legend not available for type ${this.maplayer.type}</div>`;
      }
    }
    return html`
      <style>
        .legendcontainer {
          text-align: left;
          padding-left: 5px;
          background: white;
        }
      </style>
      <div class="legendcontainer">${legendContent}</div>`;
  }
}

customElements.define('map-legend-panel', MapLegendPanel);