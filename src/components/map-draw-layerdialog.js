import {LitElement, html, css} from 'lit';

function _uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

const FormStatus = {
    setLayer: 1,
    setLayerDetail:2
};
const FormError = {
    noError: 0,
    noLayerName: 1
}

export class MapDrawLayerDialog extends LitElement {
    static get styles() {
        return css`
        :host {
            display: block;
        }
        .button {
            display: inline-block;
            color: white;
            background-color: #2e7dba;
            border-radius: 4px;
            text-align: center;
            border: 1px solid lightgray;
            height: 22px;
            margin-top: 2px;
            height: 22px;
            padding-left: 5px;
            padding-right: 5px;
            min-width: 60px;
        }
        .button:hover {
            cursor: pointer;
            background-color: #4791c9;
        }
        #overlay {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(204,204,204,0.6);
            z-index: 3; /* mapbox-gl uses z-index 2 for tools */
        }
        #window {
          display: flex;
          flex-direction: column;
          border: 1px solid lightgray;
          box-shadow: 4px 4px 9px 0px rgba(168,168,168,1);
          border-radius: 4px;
          max-width: 50%;
          min-height: 120px;
          max-height: 80%;
          background-color: white;
          font-size: 14px;
        }
        #header {
          display: block;
          height: 2em;
          border-bottom: 1px solid whitesmoke;
          background-color: #2e7dba;
          color: white;
        }
        #closebutton {
          float: right;
          padding: 2px 10px;
          margin: 2px;
          cursor: pointer;
          font-weight: bold;
        }
        #closebutton:hover {
          background-color: lightgray;
          color: black;
        }
        #layerlist {
            max-height: 200px;
            overflow: auto;
        }
        #content {
          overflow: auto;
          padding: 5px;
        }
        .error {
            color: red;
        }
        .btnsmall {
            width: 20px;
            height: 20px;
            line-height: 100%;
            box-sizing: border-box;
            text-align: center;
            padding: 0;
        }
        .btncolumn {
            width: 22px;
        }
        table, th, td {
            border: 1px dotted;
            border-collapse: collapse;
        }
        .propertyname  {
            white-space: nowrap;
        }
        table {
            margin-left: 5px;
            width: 100%;
            table-layout: fixed;
        }
        th {
            background-color: lightgray;
            text-align: left;
        }
        td input {
            max-width: calc(100% - 10px);
        }
        #layerlist, #layerlist select {
            width: 100%;
        }
        `
    }
    static get properties() { 
        return { 
          active: {type: Boolean},
          formStatus: {type: Number}
        }; 
    }
    constructor(trl, propertyTypes, defaultProperties) {
        super();
        this.active = false;
        this.formStatus = FormStatus.setLayer;
        this.trl = trl;
        this.propertyTypes = propertyTypes;
        this.defaultProperties = defaultProperties;
    }
    shouldUpdate(changedProp) {
        if (changedProp.has('active')) {
            if (this.active) {
                // reset
                this.formStatus = FormStatus.setLayer;
            }
        }
        return true;
    }
    _removeProperty(event, idx) {
        this.currentEditLayer.metadata.properties.splice(idx,1);
        this.requestUpdate();
    }
    _addProperty(event) {
        const propertyName = this.shadowRoot.querySelector('#propertyName').value;
        const propertyType = this.shadowRoot.querySelector('#propertyType').value;
        if (propertyName.trim() === "") {
            return;
        }
        this.currentEditLayer.metadata.properties.push({name: propertyName, type: propertyType});
        this.shadowRoot.querySelector('#propertyName').value = "";
        this.shadowRoot.querySelector('#propertyType').options[0].selected = true;
        this.requestUpdate();
    }
    _createNewLayer() {
        this.currentEditLayer = {
            id: this.currentEditLayerId,
            metadata: {
                title: "",
                "attributes": {
                    "translations": [
                      {"name": "name", "tanslation": "naam"}
                    ]
                },
                "properties": this.defaultProperties.map(prop=>({name: prop.name, type: prop.type}))
            }
        }
    }
    _layerTypeName()
    {
        let layerTypeName;
        switch (this.featureType) {
            case 'Point':
                layerTypeName = 'puntenlaag';
                break;
            case 'Line':
                layerTypeName = 'lijnenlaag';
                break;
            case 'Polygon':
                layerTypeName = 'vlakkenlaag';
                break;
            default:
                layerTypeName = 'tekenlaag'
        }
        return layerTypeName;
    }
    _renderLayerForm(){
        switch(this.formStatus) {
            case FormStatus.setLayer:
                const newId = _uuidv4();
                return html`
                <div>Kies een laag om in te tekenen (${this.trl(this.featureType)}): </div>
                <div id="layerlist">
                    <select size="4">
                        <option value="${newId}">Nieuwe ${this._layerTypeName()}</option>
                        ${this.editableLayers.map(layer=>{
                            return html`<option value="${layer.id}" ?selected="${layer.id===this.currentEditLayerId}">${layer.metadata.title}</option>`
                        })}
                    </select>
                </div>
                <div class="button" @click="${(e)=>this._handleNextButtonClick(e)}">Volgende</div>
                `
            case FormStatus.setLayerDetail:
                if (!(this.currentEditLayer && this.currentEditLayer.id === this.currentEditLayerId)) {
                    this.currentEditLayer = this.editableLayers.find(layer=>layer.id === this.currentEditLayerId);
                }
                if (!this.currentEditLayer) {
                    this._createNewLayer();
                }
                let placeHolder = this.currentEditLayer.metadata.title;
                if (placeHolder === "") {
                    placeHolder = `naam nieuwe ${this._layerTypeName()}`
                }
                return html`
                <label for="layername">Laag naam:</label><input id="layername" type="text" value="${this.currentEditLayer.metadata.title}" placeholder="${placeHolder}">
                ${this.formError === FormError.noLayerName ? html`<div class="error">Voer een naam in</div>`:''}
                <div>
                    <div>${this.trl(this.featureType)} eigenschappen:</div>
                    <div>
                    <table id="propertytable">
                        <tr><th>${this.trl('name')}</th><th>${this.trl('type')}</th><th class="btncolumn"></th></tr>
                        ${this.currentEditLayer.metadata.properties.map((property,idx)=>html`<tr><td>${this.trl(property.name)}</td><td>${this.trl(property.type)}</td><td>${idx===0?'':html`<button class="btnsmall" @click="${(e)=>this._removeProperty(e, idx)}">-</button>`}</td></tr>`)}
                        <tr>
                        <td><input id="propertyName" type="text" placeholder="eigenschap"></td>
                        <td>
                            <select id="propertyType">
                            ${this.propertyTypes[this.featureType].map((type, idx)=>html`<option ?selected=${idx===0} value="${type}">${this.trl(type)}</option>`)}
                            </select>
                        </td>
                        <td><button class="btnsmall" @click="${(event)=>this._addProperty(event)}">+</button></tr>
                    </table>
                    </div>
                </div>
                <div class="button" @click=${(e)=>this._handleBackButtonClick(e)}>Vorige</div>
                <div class="button" @click=${(e)=>this._handleOkButtonClick(e)}>OK</div>
                `;
            default:
                return html`invalid form status`;
        }
    }
    render() {
        if (!this.active) {
            return html``;
        }
        return html`
        <div id="overlay">
            <div id="window" @click=${e=>e.stopPropagation()}>
                <div id="header"><div @click=${e=>this._close(e)} id="closebutton">x</div></div>
                <div id="content">
                    ${this._renderLayerForm()}
                </div>
            </div>
        </div>`
    }
    firstUpdated() {

    }
    updated() {

    }
    _handleBackButtonClick(e) {
        this.formStatus = FormStatus.setLayer;
    }
    _handleNextButtonClick(e) {
        this.currentEditLayerId = this.shadowRoot.querySelector('select').value;
        this.formStatus = FormStatus.setLayerDetail;
    }
    _checkForm() {
        const layername = this.renderRoot.querySelector('#layername').value.trim();
        if (layername === '') {
            this.formError = FormError.noLayerName;
            return false;
        }
        this.formError = FormError.noError;
        return true;
    }
    _handleOkButtonClick(e) {
        if (this._checkForm()) {
            const dialogLayerTitle = this.shadowRoot.querySelector('#layername').value.trim();
            this.titleHasChanged = (dialogLayerTitle !== this.currentEditLayer.metadata.title);                
            this.currentEditLayer.metadata.title = dialogLayerTitle;
            this._addProperty(); // add property if user forgot to click '+' button
            if (!this.editableLayers.find(layer=>layer.id === this.currentEditLayerId)) {
                this.editableLayers.push(this.currentEditLayer);
            }
            if (this.clickHandler) {
                this.clickHandler();
                this.active = false;
            }
        } else {
            this.requestUpdate();
        }
    }
    _close(e) {
        this.active = false;
    }
}

customElements.define('map-draw-layerdialog', MapDrawLayerDialog);