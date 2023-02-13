import '@material/mwc-button';

import {LitElement, html} from 'lit';

/**
* @polymer
* @extends HTMLElement
*/
class MapPitch extends LitElement {
  static get properties() { 
    return { 
      active: Boolean,
      pitch: Number
    }; 
  }
  constructor() {
      super();
      this.active = false;
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
  render() {
    return html`
      <style>
        .edugisblue {
        --mdc-theme-on-primary: white;
        --mdc-theme-primary: #00401C;
        --mdc-theme-on-secondary: white;
        --mdc-theme-secondary: #00401C;
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
        <div class="heading">Huidige kaarthoek</div>
        <mwc-button class="edugisblue" ?outlined="${this.pitch!==0}" ?unelevated="${this.pitch===0}" @click="${e=>this.updatePitch(0)}">0&deg;</mwc-button>
        <mwc-button class="edugisblue" ?outlined="${this.pitch===0 || this.pitch===60}" ?unelevated="${this.pitch!==0 && this.pitch!==60}" @click="${e=>this.updatePitch(this.pitch===0||this.pitch===60?30:this.pitch)}">${this.pitch!==0 && this.pitch!==60?Math.round(this.pitch):30}&deg;</mwc-button>
        <mwc-button class="edugisblue" ?outlined="${this.pitch!==60}" ?unelevated="${this.pitch===60}" @click="${e=>this.updatePitch(60)}">60&deg;</mwc-button>
        <div class="toolpanel">Kies hierboven een andere kaarthoek<br><i>of</i> gebruik CTRL + muisknop<br><i>of</i> sleep de kompasnaald links onderaan de kaart</div>
      </div>`;          
  }
  updated() {
    // remove focus from buttons
    this.shadowRoot.querySelectorAll('mwc-button').forEach(button=>button.blur());
  }
}
customElements.define('map-pitch', MapPitch);
