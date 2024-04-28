import {LitElement, html, css} from 'lit';
import {translate as t, registerLanguageChangedListener, unregisterLanguageChangedListener} from '../i18n.js';

/* polyfill */
Math.log10 = Math.log10 || function(x) {
  return Math.log(x) * Math.LOG10E;
};


/**
* @polymer
* @extends HTMLElement
*/
class MapCoordinates extends LitElement {
  static styles = css`
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
  `;
  static get properties() { 
    return { 
      visible: Boolean,
      lat: {type: Number},
      lon: {type: Number},
      resolution: {type: Number},
      clickpoint: {type: Array},
      copiedcoordinate: {type: String},
      clickpointHtml: {type: Object, attribute: false}
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
    this.copiedcoordinate = '';
    this.West = 'W';
    this.East = 'E';
    this.North = 'N';
    this.South = 'S';
  }
  initNorthEastSouthWest() {
    this.West = t('W');
    this.East = t('E');
    this.North = t('N');
    this.South = t('S');
  }
  connectedCallback() {
    super.connectedCallback()
    this.languageChanged = this.languageChanged.bind(this);
    registerLanguageChangedListener(this.languageChanged);
    this.initNorthEastSouthWest();
  }
  disconnectedCallback() {
    super.disconnectedCallback()
    unregisterLanguageChangedListener(this.languageChanged);
  }
  languageChanged() {
    this.initNorthEastSouthWest();
    this.requestUpdate();
  }
  copyCoords(e) {
    const copy = this.shadowRoot.querySelector('#copied');
    this.copiedcoordinate = `${this.clickpoint[1].toFixed(this.factor)},${this.clickpoint[0].toFixed(this.factor)}`;
    copy.innerHTML = this.copiedcoordinate;
    window.getSelection().removeAllRanges();
    const range = document.createRange();
    range.selectNodeContents(copy);
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    copy.innerHTML = 'Copied!';
    copy.classList.add('animate');
    setTimeout(()=>copy.classList.remove('animate'), 1500);
    this.dispatchEvent(new CustomEvent('copiedcoordinate', {
        detail: this.copiedcoordinate
    }))
  }
  shouldUpdate(_changedProps) {
    return this.visible;
  }
  updated(changedProps) {
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
          #clickpoint {
            cursor: pointer;
          }
          #copied {
            position: absolute;
            width: 0;
            text-align: center;
            margin-left: -2.5em;
            top: 2px;
            display: inline-block;
            opacity: 0;
            background: lightyellow;
          }
          .ul:hover {
            text-decoration: underline;
          }
          #copied.animate {
            width: 5em;
            opacity: 1;
          }
        </style>        
        <div id="clickpoint" 
          @click="${e=>this.copyCoords(e)}"><span class="ul">Click</span>: ${this.latLongString([this.clickpoint[0],this.clickpoint[1]])}</div>
        <div id="copied">Copied!</div>`;
    }
  }
  latLongString(point) {
    const lon = parseFloat(point[0].toFixed(this.factor));
    let longitude = `${lon}°`
    if (lon > -180 && lon < 0) {
      longitude = `${longitude}${this.West}`;
    } else if (lon > 0 && lon < 180) {
      longitude=`${longitude}${this.East}`;
    }
    const lat = parseFloat(point[1].toFixed(this.factor));
    let latitude = `${lat}°`;
    if (lat > -90 && lat < 0) {
      latitude = `${latitude}${this.South}`;
    } else if (lat > 0 && lat < 90) {
      latitude = `${latitude}${this.North}`;
    }
    return `${latitude} ${longitude}`;
  }
  render() {
    return html`
      <div>${this.latLongString([this.lon,this.lat])}</div>
    ${this.clickpointHtml}
    `
  }
}
customElements.define('map-coordinates', MapCoordinates);
