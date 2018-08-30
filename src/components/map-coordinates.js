import {LitElement, html} from '@polymer/lit-element';
class MapCoordinates extends LitElement {
  static get properties() { 
    return { 
      visible: Boolean,
      lat: Number,
      lon: Number,
      resolution: Number,
      clickpoint: Array
    }; 
  }
  constructor() {
    super();
    this.clickpointHtml = '';
    this.factor = 7;
    // properties
    this.visible = true;
    this.lat = 0.0;
    this.lon = 0.0;
    this.resolution = 0.0;
    this.clickpoint = [];
  }
  _shouldRender(props, changedProps, prevProps) {
    if (changedProps.hasOwnProperty('resolution')) {
      if (props.resolution > 0) {
        this.factor = -Math.round(Math.log10(props.resolution));
      } else {
        this.factor = 7;
      }
    }
    if (changedProps.hasOwnProperty('clickpoint') && props.clickpoint.length === 2) {
      this.clickpointHtml = html`<br/>Click: ${props.clickpoint[0].toFixed(this.factor)}&deg;&#x2194;&nbsp;&nbsp;${props.clickpoint[1].toFixed(this.factor)}&deg;&#x2195`
    }
    return this.visible;
  }
  _render({visible, lat, lon, resolution}) {
    return html`<style>
      :host {
        background-color: rgba(255, 255, 255, 0.75);
        font-size: 12px;
        position: absolute;
        display: inline-block;
        width: 20em;
        bottom: 10px;
        left: 50%;
        margin-left: -10em;
        text-align: center;
        border-radius: 4px;
        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
      }
    </style>
    ${lon.toFixed(this.factor)}&deg;&#x2194;&nbsp;&nbsp;${lat.toFixed(this.factor)}&deg;&#x2195;
    ${this.clickpointHtml}
    `
  }
}
customElements.define('map-coordinates', MapCoordinates);
