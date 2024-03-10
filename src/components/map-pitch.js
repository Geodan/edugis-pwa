import '@material/mwc-button';

import {LitElement, html} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {translate as t, registerLanguageChangedListener, unregisterLanguageChangedListener} from '../i18n.js';
import './base/base-checkbox.js'

/**
* @polymer
* @extends HTMLElement
*/
class MapPitch extends LitElement {
  static get properties() { 
    return { 
      active: {type: Boolean},
      pitch: {type: Number},
      terrainActive: {type: Boolean, attribute: 'terrain-active'},
      terrainButton: {type: Boolean, attribute: 'terrain-button'}
    }; 
  }
  constructor() {
      super();
      this.active = false;
      this.terrainActive = false;
      this.terrainButton = false;
  }
  connectedCallback() {
    super.connectedCallback()
    this.languageChanged = this.languageChanged.bind(this);
    registerLanguageChangedListener(this.languageChanged);
  }
  disconnectedCallback() {
    super.disconnectedCallback()
    unregisterLanguageChangedListener(this.languageChanged);
  }
  languageChanged() {
    this.requestUpdate();
  }
  shouldUpdate(changedProps) {
    return this.active;
  }
  updatePitch(degrees) {
    this.dispatchEvent(
      new CustomEvent('updatepitch',
        {
          detail: {
            degrees: degrees
          }
        }
      )
    );
  }
  renderTerrainButton() {
    if (this.terrainButton) {
      return html`<div>
        <base-checkbox small ?checked="${this.terrainActive}" @change="${e=>this.updateTerrain(e.target.checked)}"> ${t('Show terrain in 3D')}</base-checkbox>
      </div>`;
    }
    return html``;
  }
  render() {
    return html`
      <style>
        .edugisblue {
        --mdc-theme-on-primary: var(--theme-color, white);
        --mdc-theme-primary: var(--theme-background-color, #2E7DBA);
        --mdc-theme-on-secondary: var(--theme-color, white);
        --mdc-theme-secondary: var(--theme-background-color, #2E7DBA);
      }
      .padded {
        padding: 10px;
      }
      .heading {
        font-weight: bold;
        border-bottom: 1px solid lightgray;
        padding-bottom: 10px;
        margin-bottom: 10px;
      }
      .toolpanel {
        font-size: 14px;
        padding-top: 8px;
      }
      </style>
      <div class="padded" style="user-select:none">
        <div class="heading">${t('Current view angle')}</div>
        <mwc-button class="edugisblue" ?outlined="${this.pitch!==0}" ?unelevated="${this.pitch===0}" @click="${e=>this.updatePitch(0)}">0&deg;</mwc-button>
        <mwc-button class="edugisblue" ?outlined="${this.pitch===0 || this.pitch===60}" ?unelevated="${this.pitch!==0 && this.pitch!==60}" @click="${e=>this.updatePitch(this.pitch===0||this.pitch===60?30:this.pitch)}">${this.pitch!==0 && this.pitch!==60?Math.round(this.pitch):30}&deg;</mwc-button>
        <mwc-button class="edugisblue" ?outlined="${this.pitch!==60}" ?unelevated="${this.pitch===60}" @click="${e=>this.updatePitch(60)}">60&deg;</mwc-button>
        <div class="toolpanel">
          ${unsafeHTML(t('Choose another view angle above<br><i>or</i> use CTRL + mouse button<br><i>or</i> drag the compass needle at the bottom left of the map'))}
          ${this.renderTerrainButton()}
        </div>
      </div>`;          
  }
  updated() {
    // remove focus from buttons
    this.shadowRoot.querySelectorAll('mwc-button').forEach(button=>button.blur());
  }
  updateTerrain(checked) {
    this.dispatchEvent(
      new CustomEvent('updateterrain',
        {
          detail: {
            checked: checked
          }
        }
      )
    );
  }
}
customElements.define('map-pitch', MapPitch);
