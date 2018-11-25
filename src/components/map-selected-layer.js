import {LitElement, html} from '@polymer/lit-element';
import {settingsIcon, 
  visibleCircleIcon,
  invisibleCircleIcon, 
  arrowOpenedCircleIcon, 
  trashBinCircleIcon} from './my-icons';
import './map-slider';

/**
* @polymer
* @extends HTMLElement
*/
class MapSelectedLayer extends LitElement {
  static get properties() { 
    return { 
      active: {type: Boolean},
      layer: {type: Object},
      zoom: {type: Number},
      updatecount: {type: Number}
    }; 
  }
  constructor() {
    super();
    this.active = true;
    this.layer = undefined;
    this.zoom = 0;
    this.updatecount = 0;
    this.percentage = 100;
    this.inrange = true;
  }
  shouldUpdate(changedProps) {
    if (changedProps.has('zoom')) {
      const minzoom = this.layer.minzoom ? this.layer.minzoom : 0;
      const maxzoom = this.layer.maxzoom ? this.layer.maxzoom : 24;
      this.outofrange = this.zoom < minzoom || this.zoom > maxzoom;
    }
    if (changedProps.has('layer')) {
      // set layer defaults
      if (this.layer) {
        if (!this.layer.metadata) {
          this.layer.metadata = {};
        }
      }
      if (!this.layer.metadata.hasOwnProperty('legendvisible')) {
        this.layer.metadata.legendvisible = ((!this.layer.metadata.reference) && this.layer.type !== "background");
      }
    }
    return this.active;
  }
  render() {
    return html`<style>
    .layercontainer {
      display: block;
      background: white;
      border-radius: 4px;
      padding: 10px;
      margin-top: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px;
    }
    .layercontainer:hover {
      box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
    }
    .titlebox {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .layertitle {
      display: inline-block;
    }
    .lightgray {
      color: #ccc;
    }
    .iconbox {
      width: 86px;
      display: flex;
      justify-content: flex-end;
    }
    .iconcontainer {
      display: inline-block;
      cursor: pointer;
    }
    .closed {
      transform: rotate(-90deg);
      transform-origin: 13px 13px;
    }
    .legendcontainer {
      margin-top: 4px;
      border-top: 1px solid #F3F3F3;
      padding-top: 4px;
    }
    </style>
    <div class="layercontainer">
      <div class="titlebox">
        <div class="layertitle${this.outofrange || this.layer.metadata.layervisible === false ?' lightgray':''}">${this.layer.metadata && this.layer.metadata.title?this.layer.metadata.title:this.layer.id}</div>
        <div class="iconbox">
          <div title="zichtbaarheid" class="iconcontainer" @click="${e=>this.toggleVisibility(e)}">${this.layer && this.layer.metadata && this.layer.metadata.layervisible === false?invisibleCircleIcon:visibleCircleIcon}</div>
          ${(!this.outofrange) && this.layer.metadata && this.layer.metadata.legendvisible && this.layer.metadata.layervisible !== false?
            html`          
              <div title="instellingen" class="iconcontainer" @click="${e=>this.toggleSettings(e)}">${settingsIcon}</div>`
          : html``}
          ${this.layer.metadata && this.layer.metadata.layervisible !== false ? 
            html`<div title="inklappen" class="iconcontainer${this.layer.metadata && this.layer.metadata.legendvisible?'':' closed'}" @click="${e=>this.toggleLegend(e)}">${arrowOpenedCircleIcon}</div>`
          : html``}
        </div>
      </div>
      ${this.renderSettings()}
      ${this.renderLegend()}
    </div>
    `;
  }
  renderLegend(){
    if (this.layer && 
        this.layer.metadata && 
        this.layer.metadata.legendvisible &&
        this.layer.metadata.layervisible !== false ) {
      if (this.outofrange) {
        if (this.zoom < this.layer.minzoom) {
          return html`<div class="legendcontainer">Zoom verder in</div>`
        } else {
          return html`<div class="legendcontainer">Zoom verder uit</div>`
        }
      }
      if (this.layer.metadata.legendurl) {
        return html`<div class="legendcontainer"><img src="${this.layer.metadata.legendurl}"></div>`
      }
      return html`<div class="legendcontainer">Geen legenda beschikbaar</div>`;  
    }
    return html``;
  }
  toggleLegend(e) {
    if (!this.layer.metadata) {
      this.layer.metadata = {};
    }
    this.layer.metadata.legendvisible = !this.layer.metadata.legendvisible;
    this.updatecount++;
  }
  renderSettings() {
    if (this.layer && this.layer.metadata && 
        this.layer.metadata.legendvisible &&
        this.layer.metadata.settingsvisible &&
        (!this.outofrange) &&
        this.layer.metadata.layervisible !== false) {
      if (!this.layer.metadata.hasOwnProperty('opacity')) {
        this.layer.metadata.opacity = 100;
      }
      return html`
      <style>
        .settingscontainer, .trashbincontainer {
          margin-top: 10px;
        }
        .transparencycontainer, .trashbincontainer {
          border-top: 1px solid #F3F3F3;
          padding-top: 4px;
        }
        .slidercontainer {
          margin-top: -10px;
          height: 40px;
          width: 168px;
          margin-left: 7px;
          --mdc-theme-primary: #ccc;
          --mdc-theme-secondary: #555;
        }
        .trashbinicon {
          float: right;
          cursor: pointer;
        }
        .percentage {
          display: inline-block;
          line-height: 14px;
          margin-left: 8px;
        }
        .label {
          display: inline-block;
          top: 10px;
          font-weight: bold;
        }
        .trashtext {
          padding-top: 10px;
        }
      </style>
      <div class="settingscontainer">
        <div class="transparencycontainer">
          <div class="label">Transparantie:</div><div class="percentage">${100-this.layer.metadata.opacity}%</div>
          <div class="slidercontainer">
            <map-slider @slidervaluechange="${e=>this.updateTransparency(e)}" value="${100-this.layer.metadata.opacity}"></map-slider>
          </div>
        </div>
        <div class="trashbincontainer">
          <div class="label">Kaartlaag verwijderen</div>
          <div class="trashbinicon" @click="${e=>this.removeLayer(e)}" title="kaartlaag verwijderen">${trashBinCircleIcon}</div>
          <div class="trashtext">De laag kan weer toegevoegd worden via het data-catalogus menu</div>
        </div>
      </div>`
    }
  }
  toggleSettings(e) {
    if (!this.layer.metadata) {
      this.layer.metadata = {};
    }
    this.layer.metadata.settingsvisible = !this.layer.metadata.settingsvisible;
    this.updatecount++;
  }
  toggleVisibility(e) {
    if (this.toggleDebounce) {
        return;
    }
    this.toggleDebounce = true;
    if (!this.layer || !this.layer.metadata) {
      return;
    }
    this.updatecount++;
    if (this.layer.metadata.hasOwnProperty('layervisible')) {
      this.layer.metadata.layervisible = !this.layer.metadata.layervisible;
    } else {
      this.layer.metadata.layervisible = false;
    }
    this.dispatchEvent(
      new CustomEvent('updatevisibility', 
        {
          detail: {
            layerid: this.layer.id, 
            visible: this.layer.metadata.layervisible,
          },
          bubbles: true,
          composed: true
        }
      )
    );
    setTimeout(()=>this.toggleDebounce = false, 500);
  }
  updateTransparency(e) {
    this.layer.metadata.opacity = 100-Math.round(e.detail.value);
    e.detail.layerid = this.layer.id;
    this.updatecount++;
    this.dispatchEvent(
      new CustomEvent('updateopacity', 
        {
          detail: {
            layerid: this.layer.id, 
            opacity: this.layer.metadata.opacity / 100.0,
          },
          bubbles: true,
          composed: true
        }
      )
    );
  }
  removeLayer(e) {
    this.dispatchEvent(
      new CustomEvent('removelayer',
        {
          detail: {layerid: this.layer.id},
          bubbles: true,
          composed: true
        })
    );
  }
}
customElements.define('map-selected-layer', MapSelectedLayer);
