import {LitElement, html, svg, css} from 'lit-element';
import './map-iconbutton';
import './map-datatool-distance';
import './map-iconbutton';
import {bufferIcon} from './my-icons';
import { measureIcon} from '../gm/gm-iconset-svg';

//const dummyIcon = svg`<svg height="24" width="24" viewbox="0 0 24 24"><style>.normal{ font: bold 18px sans-serif;}</style><text x="4" y="16" class="normal">A</text></svg>`;


/**
* @polymer
* @extends HTMLElement
*/
class MapDataToolbox extends LitElement {
  static get properties() { 
    return {
      active: {type: Boolean},
      map: {type: Object},
      currentTool: {type: String}
    }; 
  }
  static get styles() {
    return css`
      .drawcontainer {font-size: 14px;}
      .header {font-weight: bold; padding-bottom:10px; padding-top: 10px; border-bottom: 1px solid lightgray;}
      .buttonbar {height: 55px;width:100%; margin-top: 19px; margin-bottom: 15px;}
      .tool {display: inline-block; height: 55px; width: 55px; line-height: 67px;}
    `
  }
  constructor() {
      super();
      this.map = null;
      this.active = false;
      this.currentTool = "";
  }
  render() {
    if (!this.active) {
      return html``;
    }
    return html`
      <div class="drawcontainer" @dragover="${e=>e.preventDefault()}" @drop="${(e)=>this._handleDrop(e)}">
        <div class="header">Gegevens combineren</div>
        Selecteer een tool om vectorgegevens uit de verschillende lagen te combineren.
          <div class="buttonbar">
            <div class="tool">
            <map-iconbutton .active="${this.currentTool==='distancetool'}" .icon="${measureIcon}" info="Afstanden berekenen" @click="${e=>this.currentTool='distancetool'}"></map-iconbutton>
            </div>
            <div class="tool">
            <map-iconbutton .active="${this.currentTool==='buffertool'}" .icon="${bufferIcon}" info="Bufferen" @click="${e=>this.currentTool='buffertool'}"></map-iconbutton>
            </div>
        </div>
        <div class="toolpanel">
          ${this._renderCurrentTool()}
        </div>
      </div>
    `
  }
  _renderCurrentTool() {
    switch (this.currentTool) {
      case "":
        return html`Kies combineergereedschap via de knoppen`;
      case "distancetool":
        return html`<map-datatool-distance .map=${this.map}></map-datatool-distance>`;
      default:
        return html`Nog niet geimplementeerd: '${this.currentTool}'`;
    }
  }
}
customElements.define('map-data-toolbox', MapDataToolbox);
