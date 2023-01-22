import {LitElement, html, css} from 'lit';
import getVisibleFeatures from '../utils/mbox-features';
import './wc-button';

class MapDatatoolIntersect extends LitElement {
    static get styles() {
        return css`
        :host {
            display: block;
        }`
    }
    static get properties() { 
        return { 
          resulttype: {type: String},
          map: {type: Object},
          intersectCount: {type: Number},
          busyMessage: {type: String}
        }; 
    }
    constructor() {
        super();
        this.resulttype = 'aantal';
        this.map = {};
        this.intersectCount = -1;
        this.worker = new Worker('./src/workers/intersect.js');
        this.worker.onmessage = (e) => this._handleWorkerMessage(e);
        this.busyMessage = '';
    }
    connectedCallback() {
        super.connectedCallback()
        //addEventListener('keydown', this._handleKeydown);
    }
    disconnectedCallback() {
        super.disconnectedCallback()
        //window.removeEventListener('keydown', this._handleKeydown);
    }
    shouldUpdate(changedProp) {
        if (changedProp.has('sprop')) {
            // do something with sprop change
        }
        return true;
    }
    render() {
        return html`
            <b>Intersect berekenen</b><p></p>
            Bereken elementen in kaartlaag 1 die een element in kaartlaag2 snijden (ergens raken)<p></p>
            <b>Kaartlaag 1</b><br>
            ${this._renderLayerList()}
            <b>Kaartlaag 2</b><br>
            ${this._renderLayerList()}
            <input type="radio" name="resulttype" value="aantal" id="aantal" ?checked="${this.resulttype==='aantal'}"><label for="aantal">Aantal</label><br>
            <input type="radio" name="resulttype" value="layeryes" id="layeryes" ?checked="${this.resulttype==='layeryes'}"><label for="layeryes">Uitvoerkaartlaag met elementen met een overlap</label><br>
            <input type="radio" name="resulttype" value="layerno" id="layerno" ?checked="${this.resulttype==='layerno'}"><label for="layerno">Uitvoerkaartlaag met elementen zonder een overlap</label><br>
            <wc-button class="edugisblue" @click="${e=>this._handleClick(e)}" ?disabled="${!this.buttonEnabled}">Berekenen</wc-button><br>
            ${this.busyMessage !== '' ? html`${this.busyMessage}`:html``}
            ${this.intersectCount > -1 ?html`Aantal elementen: ${this.intersectCount}`:html``}
    </div>
    `
    }
    firstUpdated() {

    }
    updated() {

    }
    _layerSelected(e) {
      const selections = this.shadowRoot.querySelectorAll('select');
      this.buttonEnabled = (selections.length === 2 && (selections[0].value != selections[1].value) && (selections[0].value !== '') && selections[1].value !== '');
      this.sourceLayerid = this.buttonEnabled ? selections[0].value : undefined;
      this.targetLayerid = this.buttonEnabled ? selections[1].value : undefined;
      this.intersectCount = -1;
      this.update();
    }
    _renderLayerList() {
      const layers = this.map.getStyle().layers.filter(layer=>layer.metadata && !layer.metadata.reference && !layer.metadata.isToolLayer && ['fill','line','circle','symbol'].includes(layer.type));
      if (layers.length < 2) {
        return html`${layers.length} kaartlagen aanwezig (minimmaal 2 nodig)`;
      }
      return html`<div class="styled-select"><select @change="${e=>this._layerSelected(e)}">
      <option value="" disabled selected>Selecteer kaartlaag</option>
      ${layers.map(layer=>html`<option value=${layer.id}>${layer.metadata.title?layer.metadata.title:layer.id}</option>`)}
      </select><span class="arrow"></span></div>`
    }
    async _calculateIntersect() {
      if (this.sourceLayerid && this.targetLayerid) {
        this.intersectCount = -1;
        this.busyMessage = 'Bezig met berekenen van intersecties...';
        const sourceFeatures = await getVisibleFeatures(this.map, this.sourceLayerid);
        const targetFeatures = await getVisibleFeatures(this.map, this.targetLayerid);
        this.worker.postMessage([{type: "FeatureCollection", features:sourceFeatures}, {type:"FeatureCollection", features:targetFeatures}]);
      }
    }
    _handleClick(e) {
      if (!this.buttonEnabled) {
        return;
      }
      this._calculateIntersect();
    }
    _handleWorkerMessage(event) {
      this.busyMessage = '';
      const intersectLayer = event.data;
      this.intersectCount = intersectLayer.features.reduce((total, feature)=>{
        return feature.properties.intersect?total+1:total
      }, 0);
    }
}

customElements.define('map-datatool-intersect', MapDatatoolIntersect);