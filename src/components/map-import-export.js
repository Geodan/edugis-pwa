import {LitElement, html} from '@polymer/lit-element';
import './map-iconbutton';
import {openfileIcon, downloadIcon} from './my-icons';


/**
* @polymer
* @extends HTMLElement
*/
export default class MapImportExport extends LitElement {
  static get properties() { 
    return {
      active: {type: Boolean},
      map: {type: Object},
      datacatalog: {type: Array},
      onlyselected: {type: Boolean}
    }; 
  }
  constructor() {
      super();
      this.map = null;
      this.active = false;
      this.datacatalog = [];
      this.onlyselected = false;
  }
  /* createRenderRoot() {
    return this;
  }*/
  shouldUpdate(changedProp){
    return true;
  }
  render() {
    if (!this.active) {
      return html``;
    }
    return html`
      <style>
      .rowcontainer {display: flex; align-items: flex-end;}
      .dropzone {flex-grow: 10; height: 24px; border: 1px dashed gray; border-radius: 2px; margin-right: 4px;}
      .buttoncontainer {display: inline-block; width: 20px; height: 20px; border: 1px solid gray; border-radius:4px;padding:2px;fill:gray;}
      .dragover {background-color: lightgray;}
      .spacer {flex-grow: 10;}
      </style>
      <hr>
      <div>Openen</div>
      <div class="drawcontainer" @dragover="${e=>e.preventDefault()}" @drop="${(e)=>this._handleDropZoneDrop(e)}">
      <div class="rowcontainer">
        <input type="file" id="fileElem" accept=".json" style="display:none" @change="${e=>this._openFiles(e)}">
        ${window.saveAs ? html`<div class="dropzone" @dragover="${e=>e.target.classList.add('dragover')}" @dragleave="${e=>e.target.classList.remove('dragover')}">drop config json here</map-iconbutton></div>`: ''}
        ${window.saveAs ? html`<div class="buttoncontainer right" @click="${(e)=>this.shadowRoot.querySelector('#fileElem').click()}"><map-iconbutton info="open file" .icon="${openfileIcon}"></map-iconbutton></div>`: ''}
      </div>
      <hr>
      <div>Opslaan</div>
      <input type="checkbox" name="onlyselected" ?checked="${this.onlyselected}" @click="${(e)=>this._toggleOnlyVisible(e)}"> Alleen geselecteerde kaartlagen<br>
      Zichtbare tools:<br>
      <div class="rowcontainer">
      <div class="spacer">
      ${this.toollist.map(tool=>html`<input type="checkbox" name="${tool.name}" ?checked="${tool.visible}" @click="${e=>tool.visible=!tool.visible}">${tool.name}<br>`)}
      </div>
      ${window.saveAs ? html`<div class="buttoncontainer right" @click="${(e)=>this._saveFile()}"><map-iconbutton info="opslaan" .icon="${downloadIcon}"></map-iconbutton></div>`: ''}
      </div>
      </div>
    `
  }
  _selectedLayersAndGroups(list) {
    const result = [];
    list.forEach(item=>{
      if (item.checked) {
        result.push(item);
      }
      if (item.sublayers) {
        const subresult = this._selectedLayersAndGroups(item.sublayers);
        if (subresult.length) {
          const groupItem = Object.assign({}, item);
          groupItem.sublayers = subresult;
          result.push(groupItem);
        }
      }
    })
    return result;
  }
  _saveFile(e) {
    const center = this.map.getCenter();

    const json = {
        map: { zoom: this.map.getZoom(),center: [center.lng, center.lat], pitch: this.map.getPitch(), bearing: this.map.getBearing()},
        datacatalog: this.onlyselected? this._selectedLayersAndGroups(this.datacatalog) : this.datacatalog,
        tools: this.toollist.reduce((result, tool)=>{
            result[tool.name] = {};
            if (tool.hasOwnProperty('opened')) {result[tool.name].opened = tool.opened};
            if (tool.hasOwnProperty('visible')) {result[tool.name].visible = tool.visible};
            if (tool.hasOwnProperty('position')) {result[tool.name].position = tool.position};
            if (tool.hasOwnProperty('order')) {result[tool.name].order = tool.order};
            return result;},{}),
        keys: {}
    }
    const blob = new Blob([JSON.stringify(json, null, 2)], {type: "application/json"});
    window.saveAs(blob, 'mapconfig.json');
  }

  _toggleOnlyVisible(e) {
    this.onlyselected = !this.onlyselected;
  }

  static _readFileAsText(inputFile) {
    const reader = new FileReader();
  
    return new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        reject(new DOMException("Problem parsing input file."));
      };
  
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsText(inputFile);
    });
  };
  static async _readFile(file)
  {
    try {
        const text = await MapImportExport._readFileAsText(file);
        return MapImportExport._processGeoJson(text);
    } catch(error) {
        return {error: error}
    }
  }
  _openFiles(e) {
    const file = this.shadowRoot.querySelector('#fileElem').files[0];
    MapImportExport._readFile(file).then(json=>{
        this.dispatchEvent(new CustomEvent('jsondata', {
          detail: json
        }))
    })
  }
  static _processGeoJson(data) {
    try {
      const json = JSON.parse(data);
      return json;
    } catch(error) {
      return {error: 'invalid json'};
    }
  }
  static async handleDrop(ev) {
    ev.preventDefault();
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (let i = 0; i < ev.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (ev.dataTransfer.items[i].kind === 'file') {
            let file = ev.dataTransfer.items[i].getAsFile();
            return await MapImportExport._readFile(file);
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.files.length; i++) {
        return await MapImportExport._readFile(ev.dataTransfer.files[i])
      }
    }
    return {}
  }
  _handleDropZoneDrop(ev) {
    this.shadowRoot.querySelector('.dropzone').classList.remove('dragover');
    MapImportExport.handleDrop(ev).then(json=>{
      this.dispatchEvent(new CustomEvent('jsondata', {
        detail: json
      }))
    })
  }
}
customElements.define('map-import-export', MapImportExport);
