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
  copyCoords(e) {
    const copy = this.shadowRoot.querySelector('#copied');
    copy.innerHTML = `${this.clickpoint[0].toFixed(this.factor)} ${this.clickpoint[1].toFixed(this.factor)}`;
    window.getSelection().removeAllRanges();
    const range = document.createRange();
    range.selectNode(copy);
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    copy.innerHTML = 'Copied!';
    copy.classList.add('animate');
    setTimeout(()=>copy.classList.remove('animate'), 1500);
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
      this.clickpointHtml = html`
        <style>
          #copied {
            position: absolute;
            width: 0;
            text-align: center;
            margin-left: -2.5em;
            margin-top: -1.5em;
            display: inline-block;
            opacity: 0;
            background: white;            
          }
          .ul:hover {
            text-decoration: underline;
          }
          #copied.animate {
            width: 5em;
            opacity: 1;
          }
        </style>        
        <div id="clickpoint" @click="${e=>this.copyCoords(e)}"><span class="ul">Click</span>: ${this.clickpoint[0].toFixed(this.factor)}&deg;&#x2194;&nbsp;&nbsp;${this.clickpoint[1].toFixed(this.factor)}&deg;&#x2195</div>
        <div id="copied">Copied!</div>`;
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
