// skeleton for a lit-element component
// Path: src\components\test.js
// Compare this snippet from src\components\map-datatool-intersect.js:
import {LitElement, html, css} from 'lit';
import getVisibleFeatures from '../utils/mbox-features';
import {until} from 'lit-html/directives/until.js';
import './wc-button';

// hash function
function hashCode(s) {
    for(var i = 0, h = 0; i < s.length; i++)    h = Math.imul(31, h) + s.charCodeAt(i) | 0; 
    return h;
}

class MapDatatoolFilter extends LitElement {
    static get styles() {
        return css`
        :host {
            display: block;
        }
        #form {
            position: relative;
            min-width: 250px;
            min-height: 50px;
            border: 1px solid black;
            padding: 5px;
        }
        #form select {
            width: 100%;
            margin-bottom: 5px;
        }
        #form label {
            font-weight: bold;
        }
        #form #operatorselect {
            width: 10em;
        }
        `
    }
    static get properties() { 
        return { 
          map: {type: Object},
          layerId: {type: String},
          buttonEnabled: {type: Boolean}
        }; 
    }
    constructor() {
        super();
        this.layerId = "";
        this.properties = {};
        this.selectedProperty = "";
        this.selectedOperator = "";
        this.outputLayername = "";
        this.map = {};
        this.buttonEnabled = false;
        this.value = undefined
    }
    shouldUpdate(changedProp) {
        if (changedProp.has('map')) {
            // do something with sprop change
        }
        return true;
    }
    render() {
        return html`
        <div id="form">
            ${this._renderLayerList()}
            ${until (this._renderAttributeList(), html`<p>loading...</p>`)}
            ${this._renderOperatorList()}
            ${this._renderExpression()}
            ${this._renderLogicalOperators()}
            <input type="text" placeholder="naam van uitvoerlaag" name="outputname" ?disabled="${this.layerid===""}" @keyup="${(e)=>this._outputNameUpdate(e)}" .value="${this.outputLayername}">
            <wc-button class="edugisblue" @click="${e=>this._handleClick(e)}" ?disabled="${!this.buttonEnabled}">Filteren</wc-button><br>
        </div>`
    }
    firstUpdated() {

    }
    updated() {

    }
    _outputNameUpdate(e) {
        this.outputLayername = e.target.value;
        this.buttonEnabled = this.outputLayername.trim().length && this.layerid !== "";
    }
    _renderLogicalOperators() {
        if (this.selectedProperty === "") {
            return html``;
        }
        if (this.outputLayerId === "") {
            return html``;
        }
        if (!this.map.getLayer(this.outputLayerId)) {
            return html``;
        }
        return html`<div>
        <input name="logicop" type="radio" id="and" checked><label for="and">toepassen op bestaande uitvoer</label><br/>
        <input name="logicop" type="radio" id="or"><label for="or">toevoegen aan bestaande uitvoer</label>
        </div>
        `;
    }
    _stringValueChanged(e) {
        this.value = e.target.value;
    }
    _numberValueChanged(e) {
        this.value = e.target.value;
    }
    _booleanValueChanged(e) {
        this.value = e.target.checked;
    }
    _renderExpression() {
        if (this.selectedProperty === "" || this.selectedOperator === "null" || this.selectedOperator === "!null") {
            return html``;
        }
        // add extra html to each case
        switch(this.properties[this.selectedProperty].type) {
            case "string":
                return html`<label for="stringvalue">Waarde</label><input id="stringvalue" type="text" .value="${this.value?this.value:''}" @change="${(e)=>this._stringValueChanged(e)}">`;
            case "number":
                return html`<label for="numbervalue">Waarde</label><input id="numbervalue" type="number" .value="${this.value}" @change="${(e)=>this._numberValueChanged(e)}">`;
            case "boolean":
                return html`<label for="booleanvalue">Waarde</label><input id="booleanvalue" type="checkbox" ?checked="${this.value}" @change="${(e)=>this._booleanValueChanged(e)}">`;
            default:
                return html``;
        }
    }
    _layerSelected(e) {
        this.properties = {};
        this.selectedProperty = "";
        this.selectedOperator = "";
        this.layerId = e.target.value;
        const layer = this.map.getLayer(this.layerId);
        if (!layer) {
            this.outputLayername = "";
            return;
        }
        this.outputLayerId = layer.id + "_filter_";
        this.outputLayer = this.map.getLayer(this.outputLayerId);
        if (this.outputLayer) {
            this.outputLayername = layer.metadata.title;
        } else {
            this.outputLayername = "";
        }
    }
    _operatorSelected(e) {
        this.selectedOperator = e.target.value;
        this.update();
    }
    _renderOperatorList() {
        // check if this.selectedProperty is empty string
        if (this.selectedProperty === "") {
            return html``;
        }
        switch(this.properties[this.selectedProperty].type) {
            case "string":
                return html`<label for="operatorselect">Operator</label><div class="styled-select"><select id="operatorselect" @change="${(e)=>this._operatorSelected(e)}">
                <option value="=" ?selected="${this.selectedOperator==='='}">=</option>
                <option value="<>" ?selected="${this.selectedOperator==='<>'}">!=</option>
                <option value="null" ?selected="${this.selectedOperator==='null'}">geen data (null)</option>
                <option value="!null" ?selected="${this.selectedOperator==='!null'}">wel data (not null)</option>
                <option value="contains" ?selected="${this.selectedOperator==='contains'}">bevat</option>
                <option value="!contains" ?selected="${this.selectedOperator==='!contains'}">bevat niet</option>
                <option value="startsWith" ?selected="${this.selectedOperator==='startsWith'}">begint met</option>
                <option value="endsWith" ?selected="${this.selectedOperator==='endsWith'}">eindigt met</option>
                </select><span class="arrow"></span></div>`
            case "boolean":
                return html`<label for="operatorselect">Operator</label><div class="styled-select"><select id="operatorselect" @change="${(e)=>this._operatorSelected(e)}">
                <option value="=" ?selected="${this.selectedOperator==='='}">=</option>
                <option value="<>" ?selected="${this.selectedOperator==='<>'}">!=</option>
                <option value="null" ?selected="${this.selectedOperator==='null'}">geen data (null)</option>
                <option value="!null" ?selected="${this.selectedOperator==='!null'}">wel data (not null)</option>
                </select><span class="arrow"></span></div>`
            case "number":
                return html`<label for="operatorselect">Operator</label><div class="styled-select"><select id="operatorselect" @change="${(e)=>this._operatorSelected(e)}">
                <option value=">" ?selected="${this.selectedOperator==='>'}">&gt;</option>
                <option value="<" ?selected="${this.selectedOperator==='<'}">&lt;</option>
                <option value=">=" ?selected="${this.selectedOperator==='>='}">&gt;=</option>
                <option value="<=" ?selected="${this.selectedOperator==='<='}">&lt;=</option>
                <option value="null" ?selected="${this.selectedOperator==='null'}">geen data (null)</option>
                <option value="!null" ?selected="${this.selectedOperator==='!null'}">wel data (not null)</option>
                </select><span class="arrow"></span></div>`
            case "mixed":
                return html`<label for="operatorselect">Operator</label><div class="styled-select"><select id="operatorselect" @change="${(e)=>this._operatorSelected(e)}">
                <option value="=" ?selected="${this.selectedOperator==='='}">=</option>
                <option value="<>" ?selected="${this.selectedOperator==='<>'}">!=</option>
                <option value=">" ?selected="${this.selectedOperator==='>'}">&gt;</option>
                <option value="<" ?selected="${this.selectedOperator==='<'}">&lt;</option>
                <option value=">=" ?selected="${this.selectedOperator==='>='}">&gt;=</option>
                <option value="<=" ?selected="${this.selectedOperator==='<='}">&lt;=</option>
                <option value="null" ?selected="${this.selectedOperator==='null'}">geen data (null)</option>
                <option value="!null" ?selected="${this.selectedOperator==='!null'}">wel data (not null)</option>
                <option value="contains" ?selected="${this.selectedOperator==='contains'}">bevat</option>
                <option value="!contains" ?selected="${this.selectedOperator==='!contains'}">bevat niet</option>
                <option value="startsWith" ?selected="${this.selectedOperator==='startsWith'}">begint met</option>
                <option value="endsWith" ?selected="${this.selectedOperator==='endsWith'}">eindigt met</option>
                </select><span class="arrow"></span></div>`
            default:
                return html``;
        }
    }
    _renderLayerList() {
        const layers = this.map.getStyle().layers.filter(layer=>layer.metadata && !layer.metadata.reference && !layer.metadata.isToolLayer && ['fill','line','circle','symbol'].includes(layer.type));
        if (layers.length < 1) {
          return html`${layers.length} kaartlagen aanwezig (minimmaal 1 nodig)`;
        }
        return html`<label for="layerselect">Invoerlaag</label><div class="styled-select"><select id="layerselect" @change="${e=>this._layerSelected(e)}">
        <option value="" disabled selected>Selecteer kaartlaag</option>
        ${layers.map(layer=>html`<option value=${layer.id}>${layer.metadata.title?layer.metadata.title:layer.id}</option>`)}
        </select><span class="arrow"></span></div>`
    }
    _attributeSelected(e) {
        const layer = this.map.getLayer(this.layerId);
        if (!layer) {
            return;
        }
        this.selectedProperty = e.target.value;
        this.update();
    }
    _getAttributesFromFeatures(features) {
        const attributes = {};
        features.forEach(feature=>{
            Object.keys(feature.properties).forEach(attribute=>{
                if (!attributes[attribute]) {
                    attributes[attribute] = {type: typeof feature.properties[attribute], values: []};
                } 
                if (attributes[attribute].type != typeof feature.properties[attribute]) {
                    attributes[attribute].type = "mixed";
                } else {
                    if (attributes[attribute].type == "string") {
                        if (!attributes[attribute].values.includes(feature.properties[attribute])) {
                            attributes[attribute].values.push(feature.properties[attribute]);
                        }
                    }
                }
            })
        })
        return attributes;
    }
    async _renderAttributeList() {
        if (this.layerId === "") {
            return html``;
        }
        // check if this.properties is empty object
        if (Object.keys(this.properties).length === 0 && this.properties.constructor === Object) {
            const features = await getVisibleFeatures(this.map, this.layerId);
            this.properties = this._getAttributesFromFeatures(features);
        }
        return html`<label for="attributeselect">Attribuut</label><div class="styled-select"><select id="attributeselect" @change="${e=>this._attributeSelected(e)}">
        <option value="" disabled ?selected="${this.selectedProperty===''}">Selecteer attribuut</option>
        ${Object.keys(this.properties).map(property=>html`<option value=${property} ?selected="${this.selectedProperty===property}">${property}</option>`)}
        </select><span class="arrow"></span></div>`
    }
}

//register the custom element
customElements.define('map-datatool-filter', MapDatatoolFilter);

