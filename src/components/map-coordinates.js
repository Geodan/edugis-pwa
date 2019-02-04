import {LitElement, html} from '@polymer/lit-element';

/* polyfill */
Math.log10 = Math.log10 || function(x) {
  return Math.log(x) * Math.LOG10E;
};


/**
* @polymer
* @extends HTMLElement
*/
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
  shouldUpdate(changedProps) {
    if (changedProps.has('resolution')) {
      if (this.resolution > 0) {
        this.factor = -Math.round(Math.log10(this.resolution));
      } else {
        this.factor = 7;
      }
    }    
    if (changedProps.has('clickpoint') && this.clickpoint && this.clickpoint.length === 2) {
      this.clickpointHtml = html`<br/>Click: ${this.clickpoint[0].toFixed(this.factor)}&deg;&#x2194;&nbsp;&nbsp;${this.clickpoint[1].toFixed(this.factor)}&deg;&#x2195`;
    }
    return this.visible;
  }
  render() {
    return html`<style>
      :host {
        background-color: rgba(255, 255, 255, 0.75);
        font-size: 12px;
        position: absolute;
        display: inline-block;
        width: 16em;
        bottom: 10px;
        left: 50%;
        margin-left: -10em;
        text-align: center;
        border-radius: 4px;
        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
      }
    </style>
    ${this.lon.toFixed(this.factor)}&deg;&#x2194;&nbsp;&nbsp;${this.lat.toFixed(this.factor)}&deg;&#x2195;
    ${this.clickpointHtml}
    `
  }
}
customElements.define('map-coordinates', MapCoordinates);
