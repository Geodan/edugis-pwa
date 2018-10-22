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
    let lineColor = "black";
    let lineWidth = 1;
      
    if (this.maplayer._paint) {
      if (this.maplayer._paint._values) {
        const values = this.maplayer._paint._values;
        if (values["line-color"] && values["line-color"].value.kind === "constant") {
          const rgba = values["line-color"].value.value;
          lineColor = `rgba(${rgba.r * 255},${rgba.g * 255},${rgba.b * 255},${rgba.a})`;
        }
        if (values["line-width"] && values["line-width"].value.kind === "constant") {
          lineWidth = values["line-width"].value.value;
        }
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
  fillLegend()
  {
    const paint = this.maplayer.paint;
    let fillColor = "white";
    let outlineColor;
    if (paint && paint['fill-color']) {
      fillColor = paint['fill-color'];
    }
    if (Array.isArray(fillColor) && fillColor.length) {
      if (fillColor[0] == "step") {
        // element[1] is ["get", "propertyname"] (?)
        let result = [];
        for (let i = 2; i < fillColor.length; i+=2) {
          // get color
          result.push(fillColor[i]);
        }
        fillColor = result;
      }
    }
    if (fillColor === Object(fillColor)) {
      if (fillColor.stops) {
        let color = fillColor.stops[0][1];
        for (let i = 0; i < fillColor.stops.length; i++) {
          if (this.zoom > fillColor.stops[i][0]) {
            color = fillColor.stops[i][1];
            break;
          }
        }
        fillColor = color;
      }
    }
    if (paint && paint['fill-outline-color']) {
      outlineColor = paint['fill-outline-color'];
    } else {
      outlineColor = fillColor;
    }
    if (!Array.isArray(outlineColor)) {
      outlineColor = [outlineColor];
    }
    if (!Array.isArray(fillColor)) {
      fillColor = [fillColor];
    }

    return svg`${fillColor.map((color, index)=>{
      return svg`<svg width="30" height="15">
      <rect width="30" height="15" style="fill:${color};stroke-width:1;stroke:${outlineColor[index % outlineColor.length]}" />
      </svg>`;
    })}`
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
          text-align: right;
          padding-right: 5px;
        }
      </style>
      <div class="legendcontainer">${legendContent}</div>`;
  }
}

customElements.define('map-legend-panel', MapLegendPanel);