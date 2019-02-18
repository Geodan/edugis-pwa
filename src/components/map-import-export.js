import {LitElement, html} from '@polymer/lit-element';
import './map-iconbutton';
import {openfileIcon, downloadIcon} from './my-icons';


/**
* @polymer
* @extends HTMLElement
*/
class MapImportExport extends LitElement {
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
      .buttoncontainer {display: inline-block; width: 20px; height: 20px; border: 1px solid gray; border-radius:4px;padding:2px;fill:gray;}
      .right {float: right; margin-left: 4px;}
      .dropzone {display: inline-block; height: 24px; width: 200px; border: 1px dashed gray; border-radius: 2px;}
      .dragover {background-color: lightgray;}
      </style>
      <div class="drawcontainer" @dragover="${e=>e.preventDefault()}" @drop="${(e)=>this._handleDrop(e)}">
      <input type="file" id="fileElem" accept=".json" style="display:none" @change="${e=>this._openFiles(e)}">
      ${window.saveAs ? html`<div class="buttoncontainer right" @click="${(e)=>this._saveFile()}"><map-iconbutton info="opslaan" .icon="${downloadIcon}"></map-iconbutton></div>`: ''}
      ${window.saveAs ? html`<div class="buttoncontainer right" @click="${(e)=>this.shadowRoot.querySelector('#fileElem').click()}"><map-iconbutton info="open file" .icon="${openfileIcon}"></map-iconbutton></div>`: ''}
      ${window.saveAs ? html`<div class="dropzone right" @dragover="${e=>e.target.classList.add('dragover')}" @dragleave="${e=>e.target.classList.remove('dragover')}">drop config json here</map-iconbutton></div>`: ''}
      <input type="checkbox" name="onlyselected" ?checked="${this.onlyselected}" @click="${(e)=>this._toggleOnlyVisible(e)}"> Alleen geselecteerde kaartlagen opslaan <br>
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
          const groupItem = {...item};
          groupItem.sublayers = subresult;
          result.push(groupItem);
        }
      }
    })
    return result;
  }
  _saveFile(e) {
    console.log(this.onlyselected);
    const json = {
        map: { zoom: this.map.getZoom(),center: this.map.getCenter(), pitch: this.map.getPitch(), bearing: this.map.getBearing()},
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
    window.saveAs(blob, 'edugismap.json');
  }
  _toggleOnlyVisible(e) {
    this.onlyselected = !this.onlyselected;
  }
  _readFile(file)
  {
    const reader = new FileReader();
    reader.onload = (e) => this._processGeoJson(e.target.result);
    reader.readAsText(file);
  }
  _openFiles(e) {
    const file = this.shadowRoot.querySelector('#fileElem').files[0];
    this._readFile(file);
  }
  _processGeoJson(data) {
    try {
      const json = JSON.parse(data);
      if (json.map && json.datacatalog && json.tools && json.keys) {
        
      } else {
        alert ('this json file is not recognized as an EduGIS configuration');
      }
    } catch(error) {
      alert('invalid json: ' + error);
    }
  }
  _handleDrop(ev) {
    ev.preventDefault();
    this.querySelector('.dropzone').classList.remove('dragover');
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (let i = 0; i < ev.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (ev.dataTransfer.items[i].kind === 'file') {
            let file = ev.dataTransfer.items[i].getAsFile();
            this._readFile(file);
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.files.length; i++) {
        this._readFile(ev.dataTransfer.files[i])        
      }
    }
  }
}
customElements.define('map-import-export', MapImportExport);
