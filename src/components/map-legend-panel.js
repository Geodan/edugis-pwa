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