import {LitElement, html, svg, css} from 'lit';
import {translate as t} from '../i18n.js';
import './map-iconbutton';
import './map-datatool-distance';
import './map-iconbutton';
import MapImportExport from './map-import-export';

/**
* @polymer
* @extends HTMLElement
*/
class MapSheetTool extends LitElement {
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
      .edugisblue {
        --dark-color: #2E7DBA;
        --light-color: white;
        width: 100%;
      }
    `
  }
  constructor() {
      super();
      this.map = {};
      this.active = false;
      this.currentTool = "";
  }
  render() {
    if (!this.active) {
      return html``;
    }
    return html`
      <div class="drawcontainer" @dragover="${e=>e.preventDefault()}" @drop="${(e)=>this._handleDrop(e)}">
        <div class="header">${t('Load Table')}</div>
        <br>
        <input type="file" id="fileElem" accept=".csv,.xls,.xlsx" style="display:none" @change="${e=>this._handleFiles(e)}">
        <wc-button class="edugisblue" @click="${(e)=>this.shadowRoot.querySelector('#fileElem').click()}">${t('Upload Table')}</wc-button>
        <br>
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
  _handleFiles(e) {
    const file = this.shadowRoot.querySelector('#fileElem').files[0];
    MapImportExport._readFile(file).then(droppedFile=>{
        this.dispatchEvent(new CustomEvent('droppedfile', {
          detail: droppedFile
        }))
    })
  }
}
customElements.define('map-sheet-tool', MapSheetTool);
