import {LitElement, html,css} from 'lit';
import './map-iconbutton';
import {translate as t} from '../i18n.js';


/**
* @polymer
* @extends HTMLElement
*/
export default class MapProjChooser extends LitElement {
  static get properties() { 
    return {
      active: {type: Boolean},
      map: {type: Object}
    }; 
  }
  constructor() {
      super();
      this.map = {};
      this.active = false;
  }
  static get styles() {
    return css`
    .map-overlay {
        font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;

    }
        
    .map-overlay .map-overlay-inner {
        background-color: #fff;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        border-radius: 3px;
        padding: 10px;
        margin-bottom: 10px;
    }
        
    .map-overlay-inner fieldset {
        border: none;
        padding: 0;
        margin: 0 0 10px;
    }
        
    .map-overlay-inner fieldset:last-child {
        margin: 0;
    }
        
    .map-overlay-inner select,
    .map-overlay-inner input {
        width: 100%;
    }
        
    .map-overlay-inner label {
        display: block;
        font-weight: bold;
        margin: 0 0 5px;
    }
    .conic-param-input {
        display: none;
    }`
  }
  shouldUpdate(changedProp){
    return true;
  }
  render() {
    if (!this.active) {
      return html``;
    }
    if (!this.map.setProjection) {
      return html`<div>${t('map projections not supported by this viewer')}</div>`;
    }
    return html`
        <div class="map-overlay top">
        <div class="map-overlay-inner">
        <fieldset>
        <label>${t('Select projection')}</label>
        <select @change="${e=>this._setProjection(e)}" id="projection" name="projection">
        <option value="albers">Albers</option>
        <option value="equalEarth">Equal Earth</option>
        <option value="equirectangular">Equirectangular</option>
        <option value="lambertConformalConic" >Lambert Conformal Conic</option>
        <option value="mercator" selected="">Mercator</option>
        <option value="naturalEarth">Natural Earth</option>
        <option value="winkelTripel">Winkel Tripel</option>
        <option value="globe">Globe</option>
        </select>
        </fieldset>
        <fieldset class="conic-param-input">
        <label>Center Longitude: <span id="lng-value">0</span></label>
        <input @change="${e=>this._setProjectionParameter(e)}" id="lng" type="range" min="-180" max="180" value="0">
        </fieldset>
        <fieldset class="conic-param-input">
        <label>Center Latitude: <span id="lat-value">30</span></label>
        <input @change="${e=>this._setProjectionParameter(e)}" id="lat" type="range" min="-90" max="90" value="30">
        </fieldset>
        <fieldset class="conic-param-input">
        <label>Southern Parallel Lat: <span id="lat1-value">30</span></label>
        <input @change="${e=>this._setProjectionParameter(e)}" id="lat1" type="range" min="-90" max="90" value="30">
        </fieldset>
        <fieldset class="conic-param-input">
        <label>Northern Parallel Lat: <span id="lat2-value">30</span></label>
        <input @change="${e=>this._setProjectionParameter(e)}" id="lat2" type="range" min="-90" max="90" value="30">
        </fieldset>
        </div>
        </div>
        `
  }
  _setProjection(e) {
    const conicParamInputs = this.shadowRoot.querySelectorAll('.conic-param-input');
    const lngInput = this.shadowRoot.querySelector('#lng');
    const lngValue = this.shadowRoot.querySelector('#lng-value');
    const latInput = this.shadowRoot.querySelector('#lat');
    const latValue = this.shadowRoot.querySelector('#lat-value');
    const lat1Input = this.shadowRoot.querySelector('#lat1');
    const lat1Value = this.shadowRoot.querySelector('#lat1-value');
    const lat2Input = this.shadowRoot.querySelector('#lat2');
    const lat2Value = this.shadowRoot.querySelector('#lat2-value');
    const inputs = [
        [lngInput, lngValue],
        [latInput, latValue],
        [lat1Input, lat1Value],
        [lat2Input, lat2Value]
    ];

    const isConic = ['albers', 'lambertConformalConic'].includes(e.target.value);

    // Hide non-conic projection params
    for (const input of conicParamInputs) {
        input.style.display = isConic ? 'block' : 'none';
    }

    this.map.setProjection(e.target.value);

    if (isConic) {
        const { center, parallels } = this.map.getProjection();
        lngInput.value = center[0];
        latInput.value = center[1];
        lat1Input.value = parallels[0];
        lat2Input.value = parallels[1];
    }
    for (const [input, value] of inputs) {
        value.textContent = input.value;
    }
  }
  _setProjectionParameter(e) {
    const projectionInput = this.shadowRoot.querySelector('#projection');
    const lngInput = this.shadowRoot.querySelector('#lng');
    const latInput = this.shadowRoot.querySelector('#lat');
    const lat1Input = this.shadowRoot.querySelector('#lat1');
    const lat2Input = this.shadowRoot.querySelector('#lat2');
    const value = this.shadowRoot.querySelector(`#${e.target.id}-value`);
    value.textContent = e.target.value;
    this.map.setProjection({
        name: projectionInput.value,
        center: [Number(lngInput.value), Number(latInput.value)],
        parallels: [Number(lat1Input.value), Number(lat2Input.value)]
    });
  }
}
customElements.define('map-proj-chooser', MapProjChooser);
