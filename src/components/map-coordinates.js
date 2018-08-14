import {LitElement, html} from '@polymer/lit-element';
class MapCoordinates extends LitElement {
  static get properties() { 
    return { 
      visible: Boolean,
      lat: Number,
      lon: Number,
      resolution: Number
    }; 
  }
  constructor() {
    super();
    this.visible = true;
    this.lat = 0.0;
    this.lon = 0.0;
    this.resolution = 0.0;
  }
  _shouldRender(props, changedProps, prevProps) {
    return this.visible;
  }
  _render({visible, lat, lon, resolution}) {
    let factor = 7;
    if (resolution > 0) {
      factor = -Math.round(Math.log10(resolution));  
    }
    lat = lat.toFixed(factor);
    lon = lon.toFixed(factor);
    return html`<style>
      :host {
        background-color: rgba(255, 255, 255, 0.75);
        font-size: 12px;
        position: absolute;
        display: inline-block;
        width: 30em;
        bottom: 10px;
        left: 50%;
        margin-left: -15em;
        text-align: center;
        border-radius: 4px;
        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
      }
    </style>
    ${lon}&deg;&#x2194;&nbsp;&nbsp;${lat}&deg;&#x2195;`
  }
}
customElements.define('map-coordinates', MapCoordinates);
