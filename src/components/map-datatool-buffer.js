import {LitElement, html, css} from 'lit';
import {customSelectCss} from './custom-select-css.js';
import {SphericalMercator} from '../lib/sphericalmercator.js';
import Flatbush from 'flatbush';
import './wc-button';

class MapDatatoolBuffer extends LitElement {
    static get styles() {
        return css`
          ${customSelectCss()}
          .buttoncontainer {border: 1px solid gray; border-radius:4px;padding:2px;fill:gray;width:150px;margin-top:5px;}
          .edugisblue {
            --dark-color: #2E7DBA;
            --light-color: white;
            width: 100%;
          }
          #targetname {
            width: 100%;
          }
        `
      }
    static get properties() { 
        return { 
          map: {type: Object},
          buttonEnabled: {type: Boolean},
          busyMessage: {type: String}
        }; 
    }
    constructor() {
        super();
        this.map = {};
        this.buttonEnabled = false;
        this.busyMessage = '';
        this.worker = new Worker('./src/workers/buffer.js');
        this.worker.onmessage = (e) => this._handleWorkerMessage(e);
        this.bufferSize = 100;
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
        if (changedProp.has('map')) {
            // do something with sprop change
        }
        return true;
    }
    render() {
        return html`
            <b>Buffer berekenen</b><p></p>
            Bereken een 'buffer' rondom de zichtbare elementen in kaartlaag 1<p></p>
            <b>Kaartlaag 1</b><br>
            ${this._renderLayerList()}<p></p>
            ${this._renderTargetLayer()}
            ${this._renderBusyMessage()}
            <wc-button class="edugisblue" @click="${e=>this._handleClick(e)}" ?disabled="${!this.buttonEnabled}">Berekenen</wc-button><br>
            ${this.resultMessage?this.resultMessage:''}
    </div>
    `
    }
    firstUpdated() {

    }
    updated() {

    }
    _renderBusyMessage() {
      if (this.busyMessage === '') {
        return html``;
      }
      return html`${this.busyMessage}<p></p>`
    }
    _renderTargetLayer() {
      if (!this.targetLayerid) {
        return html``;
      }
      const targetLayer = this.map.getLayer(this.targetLayerid);
      let title = '';
      let bufferSize = this.bufferSize;
      if (targetLayer && targetLayer.metadata && targetLayer.metadata.title) {
        title = targetLayer.metadata.title;
        bufferSize = targetLayer.metadata.bufferSize ? targetLayer.metadata.bufferSize : this.bufferSize;
      } else {
        const sourceLayer = this.map.getLayer(this.sourceLayerid);
        title = (sourceLayer && sourceLayer.metadata && sourceLayer.metadata.title) ? sourceLayer.metadata.title + " buffer" : "buffer";
      }
      return html`
        <label for="targetname">Uitvoer kaartlaag:</label><input name="targetname" id="targetname" type="text" value="${title}" placeholder="naam"><br/>
        <label for="targetbuffer">Buffer afstand in meters:</label><input name="targetbuffer" id="targetbuffer" type="number" value="${bufferSize}"><p></p>
        `
    }
    _renderLayerList() {
        const layers = this.map.getStyle().layers.filter(layer=>layer.metadata && !layer.metadata.reference && !layer.metadata.isToolLayer && ['fill','line','circle','symbol'].includes(layer.type));
        if (layers.length < 1) {
          return html`${layers.length} kaartlagen aanwezig (minimmaal 1 nodig)`;
        }
        return html`<div class="styled-select"><select @change="${e=>this._layerSelected(e)}">
        <option value="" disabled selected>Selecteer kaartlaag</option>
        ${layers.map(layer=>html`<option value=${layer.id}>${layer.metadata.title?layer.metadata.title:layer.id}</option>`)}
        </select><span class="arrow"></span></div>`
      }
      _layerSelected(e) {
        const selections = this.shadowRoot.querySelectorAll('select');
        if (selections.length === 1 && selections[0].value !== '') {
          this.buttonEnabled = true;
          this.sourceLayerid = selections[0].value;
          this.targetLayerid = selections[0].value + '_buffer';
        } else {
          this.buttonEnabled = false;
          this.targetLayerid = this.sourceLayerid = undefined;
        }
      }
      _handleClick(e) {
        if (!this.buttonEnabled) {
          return;
        }
        const selections = this.shadowRoot.querySelectorAll('select');
        if (selections.length === 1) {
          const layer1id = selections[0].value;
          this._calculateBuffer(layer1id);
        }
      }
      hash (str, seed = 0) { // cyrb53, https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
        let h1 = 0xdeadbeef ^ seed,
          h2 = 0x41c6ce57 ^ seed;
        for (let i = 0, ch; i < str.length; i++) {
          ch = str.charCodeAt(i);
          h1 = Math.imul(h1 ^ ch, 2654435761);
          h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        
        return 4294967296 * (2097151 & h2) + (h1 >>> 0);
      };
      async _getVisibleFeatures(layerid) {
        const layer = this.map.getLayer(layerid);
        const mapBounds = this.map.getBounds();
        if (!layer.sourceLayer && layer.type !== 'circle' && layer.type !== 'symbol') {
          // not a vector tile layer or circle layer or symbol layer
          const source = this.map.getSource(layer.source).serialize();
          if (typeof source.data === "string") {
            const response = await fetch(source.data);
            if (response.ok) {
              source.data = await response.json();
            }
          }
          const features = source.data.features.filter(feature=>{
            const bbox = turf.bbox(feature);
            return bbox[0] < mapBounds._ne.lng && bbox[2] > mapBounds._sw.lng && bbox[1] < mapBounds._ne.lat && bbox[3] > mapBounds._sw.lat;
          });
          return features;
        } else {
          const tileMap = new Map();
          const sphericalmercator = new SphericalMercator();
          const tileBorderFeatures = [];
          const features = this.map.queryRenderedFeatures(undefined,{layers:[layerid]}).map((mboxfeature, index)=>{
            const x = mboxfeature._vectorTileFeature._x;
            const y = mboxfeature._vectorTileFeature._y;
            const z = mboxfeature._vectorTileFeature._z;
            const xyz = `${x},${y},${z}`;
            let tileBBox = tileMap.get(xyz)
            if (!tileBBox) {
              tileBBox = sphericalmercator.bbox(x, y, z);
              tileMap.set(xyz, tileBBox);
            }
            const jsonFeature = mboxfeature.toJSON();
            const featureBBox = turf.bbox(jsonFeature);
            if ((featureBBox[0] < tileBBox[0] || featureBBox[2] > tileBBox[2] || featureBBox[1] < tileBBox[1] || featureBBox[3] > tileBBox[3])) {
              tileBorderFeatures.push({index:index, bbox: featureBBox});
            }
            return jsonFeature;
          });

          console.log(tileBorderFeatures);

          const index = new Flatbush(tileBorderFeatures.length);
          for (const featureInfo of tileBorderFeatures) {
            const bbox = featureInfo.bbox;
            index.add(bbox[0], bbox[1], bbox[2], bbox[3]);
          }
          index.finish();
          for (let i = 0; i < tileBorderFeatures.length; i++) {
            const featureIndex = tileBorderFeatures[i].index;
            const bbox = turf.bbox(features[featureIndex]);
            const intersectCandidates = index.search(bbox[0], bbox[1], bbox[2], bbox[3]).sort((a,b)=>a-b);
            for (let j = 0; j < intersectCandidates.length - 1; j++) {
              if (intersectCandidates[j] < i) {
                continue;
              }
              const feature1 = features[tileBorderFeatures[intersectCandidates[j]].index];
              const feature2 = features[tileBorderFeatures[intersectCandidates[j+1]].index];
              /*if (turf.booleanIntersects(feature1, feature2)) {
                const unionedFeature = turf.union(feature1, feature2);
                features[tileBorderFeatures[intersectCandidates[j+1]].index] = unionedFeature;
                features[tileBorderFeatures[intersectCandidates[j]].index] = null;
              }*/
            }
            //console.log(intersectCandidates);
          }
          //features=features.filter(feature=>feature !== null);
          
          const hashMap = new Map();
          const duplicates = [];
          for (let i = 0; i < features.length; i++) {
            let props = '';
            for (const key in features[i].properties) {
              props += features[i].properties[key];
            }
            const hash = this.hash(props);
            const items = hashMap.get(hash);
            if (!items) {
              hashMap.set(hash, [i]);
            } else {
              hashMap.set(hash, [...items,i]);
              duplicates.push({index: i, hash: hash});
            }
          }
          console.log(duplicates);
          return features;
        }
      }
      async _calculateBuffer(layerid) {
        // buffer is calculated for currently visible elements only
        const vectorFeatures = await this._getVisibleFeatures(layerid);
        //const vectorFeatures = this.map.queryRenderedFeatures(undefined,{layers:[layerid]});
        if (vectorFeatures.length) {
            let buffervalue = this.shadowRoot.querySelector('#targetbuffer').value.replace(",",".");
            if (buffervalue === "") {
              buffervalue = 0;
            }
            const bufferSize = parseFloat(buffervalue);
            if (bufferSize === 0) {
              this.busyMessage = "Een buffer van 0 heeft geen effect";
              return;
            }
            const geojson = {
                "type": "FeatureCollection",
                "features": vectorFeatures.map(vectorFeature=>{
                  return {
                    "type": "Feature",
                    "properties": vectorFeature.properties,
                    "geometry": vectorFeature.geometry
                  }
                })
            }
            this.busyMessage = "Bezig met berekenen van buffer(s)...";
            this._setTargetLayer(this.shadowRoot.querySelector("#targetname").value, bufferSize);
            this.worker.postMessage([geojson, bufferSize]);
        }
      }
      _setTargetLayer(title, bufferSize) {
        const targetLayer = this.map.getLayer(this.targetLayerid);
        if (!targetLayer) {
          const newLayer = {
            "id": this.targetLayerid,
            "metadata": {
              "title": title,
              "bufferSize": bufferSize
            },
            "type": "fill",
            "source": {
              "type": "geojson",
              "data": {
                "type": "FeatureCollection",
                "features": []
              }
            },
            "paint": {
              "fill-color": "#000",
              "fill-outline-color": "#000",
              "fill-opacity": 0.3
            }
          };
          this.dispatchEvent(new CustomEvent('addlayer', {
            detail: newLayer,
            bubbles: true,
            composed: true
          }))
        } else {
          targetLayer.metadata.bufferSize = bufferSize;
          if (title !== targetLayer.metadata.title) {
            // title changed
            targetLayer.metadata.title = title;
            this.dispatchEvent(new CustomEvent("titlechange", {}));
          }
        }
      }
      _handleWorkerMessage(event) {
        this.busyMessage = '';
        const result = event.data;
        //setTimeout(()=>{
          const targetLayer = this.map.getLayer(this.targetLayerid);
          this.map.getSource(this.targetLayerid).setData(result);
        //}, 300);
      }
}

customElements.define('map-datatool-buffer', MapDatatoolBuffer);