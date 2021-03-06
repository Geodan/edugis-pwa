import {LitElement, html} from 'lit-element';
import './map-iconbutton';
import {selectIcon, pointIcon, lineIcon, polygonIcon, trashIcon, checkIcon, combineIcon, uncombineIcon, downloadIcon, openfileIcon} from './my-icons';

const drawPolygons = {
  "id": "drawPolygons",
  "metadata": {
    "title": "Getekende vlakken"
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

const drawLines = {
  "id": "drawLines",
  "metadata": {
    "title": "Getekende lijnen"
  },
  "type": "line",
  "source" : {
    "type": "geojson",
    "data": {
      "type": "FeatureCollection",
      "features": []
    }
  },
  "paint" : {
    "line-color" : "#000",
    "line-width" : 3
  }
};

const drawPoints = {
  "id": "drawPoints",
  "metadata": {
    "title": "Getekende punten"
  },
  "type": "circle",
  "source" : {
    "type": "geojson",
    "data": {
      "type": "FeatureCollection",
      "features": []
    }
  },
  "paint" : {
    "circle-radius": 6,
    "circle-color" : "#000",
    "circle-opacity": 0.3,
    "circle-stroke-color": "#000",
    "circle-stroke-width": 2
  }
}

/**
* @polymer
* @extends HTMLElement
*/
class MapDraw extends LitElement {
  static get properties() { 
    return {
      active: {type: Boolean},
      map: {type: Object},
      selectedFeatures: {type: Array},
      drawMode: {type: String},
      message: {type: String}
    }; 
  }
  constructor() {
      super();
      this.map = null;
      this.active = false;
      this.selectedFeatures = [];
      this.drawMode = 'simple_select';
      this.featureCollection = {"type": "FeatureCollection", "features": []};
      this.featureCount = 0;
      this.message = null;
      this.timeoutId = null;
  }
  createRenderRoot() {
    return this;
  }
  shouldUpdate(changedProp){
    if (changedProp.has('map')){
      if (this.map && this.active) {
        this._addDrawToMap();
      }
    }
    if (changedProp.has('active')) {
      if (this.active) {
        this._addDrawToMap();
      } else {
        this._removeDrawFromMap();
      }
    }
    return true;
  }
  _canCombineFeatures()
  {
    if (this.selectedFeatures.length < 2) {
      return false;
    }
    const featureType = this.selectedFeatures[0].geometry.type.replace('Multi','');
    for (let i = 1; i < this.selectedFeatures.length; i++) {
      if (this.selectedFeatures[i].geometry.type.replace('Multi','') !== featureType) {
        return false;
      }
    }
    return true;
  }
  render() {
    if (!this.active) {
      return html``;
    }
    const disableDelete = (this.selectedFeatures.length === 0);
    // <div class="buttoncontainer" @click="${(e)=>this.draw.changeMode(this.drawMode = 'simple_select')}"><map-iconbutton .active="${this.drawMode === 'simple_select' || this.drawMode === 'direct_select'}" info="selecteer" .icon="${selectIcon}"></map-iconbutton></div>
    return html`
      <style>
      @import "${document.baseURI}node_modules/@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
      .drawcontainer {font-size:14px;}
      .header {font-weight: bold; padding-bottom:10px; padding-top: 10px; border-bottom: 1px solid lightgray;}
      .right {float: right; margin-left: 4px;}
      .dropzone {display: inline-block; height: 24px; width: 210px; border: 1px dashed gray; border-radius: 2px;}
      .dragover {background-color: lightgray;} 
      .buttonbar {font-size: 0;}
      .buttoncontainer {display: inline-block; box-sizing: border-box; width: 55px; height: 55px; line-height:75px;fill:darkgray;}
      .message {background-color: rgba(146,195,41,0.98);width: 100%;box-shadow: 2px 2px 4px 0; height: 36px; color: white; font-weight: bold; line-height: 36px;padding: 2px;}
      .iconcontainer {display: inline-block; width: 24px; height: 24px; fill: white; margin: 5px; vertical-align: middle;}
      </style>
      <div class="drawcontainer" @dragover="${e=>e.preventDefault()}" @drop="${(e)=>this._handleDrop(e)}">
      <div class="header">Tekenen</div>
      ${this._renderFileImportExport()}
      <div>Klik in de kaart om een figuur te tekenen. Dubbelklik om te stoppen (lijn en vlak).</div>
      <div class="buttonbar">
      
      <div class="buttoncontainer" @click="${(e)=>this.draw.changeMode(this.drawMode = 'draw_point')}"><map-iconbutton .active="${this.drawMode === 'draw_point'}" info="teken punt" .icon="${pointIcon}"></map-iconbutton></div>
      <div class="buttoncontainer" @click="${(e)=>this.draw.changeMode(this.drawMode = 'draw_line_string')}"><map-iconbutton .active="${this.drawMode === 'draw_line_string'}" info="teken lijn" .icon="${lineIcon}"></map-iconbutton></div>
      <div class="buttoncontainer" @click="${(e)=>this.draw.changeMode(this.drawMode = 'draw_polygon')}"><map-iconbutton info="teken vlak" .active="${this.drawMode === 'draw_polygon'}" .icon="${polygonIcon}"></map-iconbutton></div>
      <div class="buttoncontainer" @click="${(e)=>!disableDelete && this.draw.trash()}"><map-iconbutton .disabled="${disableDelete}" info="verwijder" .icon="${trashIcon}"></map-iconbutton></div>
      ${this._renderCombineButtons()}
      </div>
      ${this.selectedFeatures.map(feature=>{
        return Object.keys(feature.properties).map(key=>html`
          <hr>${this._translateKey(key)}<br><input type="text" @input="${(e)=>this._updateFeatureProperty(e, feature, key)}" value="${this.draw.get(feature.id).properties[key]}">\n`
          );
      })}
      ${this._renderMessage()}
      </div>
    `
  }
  _renderFileImportExport() {
    return html``;
    /*return html`
      <div>Bestanden importeren en exporteren</div>
      <input type="file" id="fileElem" accept=".json,.geojson" style="display:none" @change="${e=>this._handleFiles(e)}">
      ${window.saveAs ? html`<div class="buttoncontainer right" @click="${(e)=>this.featureCount > 0 && this._downLoad()}"><map-iconbutton info="opslaan" .disabled="${this.featureCount === 0}" .icon="${downloadIcon}"></map-iconbutton></div>`: ''}
      ${window.saveAs ? html`<div class="buttoncontainer right" @click="${(e)=>this.querySelector('#fileElem').click()}"><map-iconbutton info="open file" .icon="${openfileIcon}"></map-iconbutton></div>`: ''}
      ${window.saveAs ? html`<div class="dropzone right" @dragover="${e=>e.target.classList.add('dragover')}" @dragleave="${e=>e.target.classList.remove('dragover')}">zet hier geojson neer</map-iconbutton></div>`: ''}
      ${window.saveAs ? html`<br>`: ``}
      `;*/
  }
  _renderCombineButtons(){
    return html``;
    /*
    const disableCombine = !this._canCombineFeatures();
    const disableUncombine = !(this.selectedFeatures.length === 1 && this.selectedFeatures[0].geometry.type.startsWith('Multi'));
    return html`
      <div class="buttoncontainer" @click="${(e)=>!disableCombine && this.draw.combineFeatures()}"><map-iconbutton info="groepeer" .disabled="${disableCombine}" .icon="${combineIcon}"></map-iconbutton></div>
      <div class="buttoncontainer" @click="${(e)=>!disableUncombine && this.draw.uncombineFeatures()}"><map-iconbutton info="splits" .disabled="${disableUncombine}" .icon="${uncombineIcon}"></map-iconbutton></div>
    `
    */
  }
  _renderMessage() {
    if (this.message) {
      return html`
      <div class="message"><div class="iconcontainer">${checkIcon}</div>${this.message}</div>
      `
    }
    return ''
  }
  _getFeaturesFromLayer(layerid)
  {
    let result = [];
    const layer = this.map.getStyle().layers.find(layer=>layer.id===layerid);
    if (layer) {
      let source = layer.source;
      if (typeof source === "string") {
        source = this.map.getSource(source).serialize();
      }
      result = source.data.features;
    }
    return result;
  }
  _updateFeatureCollection()
  {
    if (this.featureCollection.features.length === 0) {
      let features = this._getFeaturesFromLayer('drawPoints');
      if (features.length) {
        this.featureCollection.features = features;
      }
      features = this._getFeaturesFromLayer('drawLines');
      if (features.length) {
        this.featureCollection.features = [...this.featureCollection.features, ...features];
      }
      features = this._getFeaturesFromLayer('drawPolygons');
      if (features.length) {
        this.featureCollection.features = [...this.featureCollection.features, ...features];
      }
    }
    if (this.featureCollection.features.length) {
      this.draw.set(this.featureCollection);
      this.featureCount = this.featureCollection.features.length;
    }
  }
  _addDrawToMap(){ 
    if (this.map) {
      // store map.boxZoom
      this.boxZoomable = this.map.boxZoom.isEnabled();
      this._setMapDrawLayersVisibility(false);
      this.draw = new MapboxDraw({
        displayControlsDefault: true,
        keybindings: true,
        controls: {point: false, line_string: false, polygon: false, trash: false, combine_features: false, uncombine_features: false}
      });
      this.draw.options.styles.forEach(style=>style.metadata = {isToolLayer: true});
      this.map.addControl(this.draw, 'bottom-right');
      this._updateFeatureCollection(); 
      this.map.on('draw.create', this.featuresCreated = (e)=>this._featuresCreated(e));
      this.map.on('draw.selectionchange', this.featuresSelected = (e)=>this._featuresSelected(e));
      this.map.on('draw.update', this.featuresUpdated = (e)=>this._featuresUpdated(e));
      this.map.on('draw.modechange', this.drawModeChange = (e)=>this._drawModeChange(e));
      this.map.on('draw.delete', this.drawDelete = (e)=>this._drawDelete(e));
      this.map.on('draw.combine', this.drawCombine = (e)=>this._drawCombine(e));
      this.map.on('draw.uncombine', this.drawUncombine = (e)=>this._drawUncombine(e));
      this.keyDownBound = this._keyDown.bind(this);
      this.map.getCanvasContainer().addEventListener('keydown', this.keyDown=(e)=>this._keyDown(e));
      setTimeout(()=>this.draw.changeMode(this.drawMode = 'simple_select'), 100);
    }
  }
  _translateKey (key) {
    switch (key) {
      case 'latitude':
        return 'Breedtegraad';
      case 'longitude':
        return 'Lengtegraad';
      case 'name':
        return 'Naam'
      case 'perimeter':
        return 'Omtrek (km)';
      case 'area':
        return 'Oppervlak (m2)';
      case 'length':
        return 'Lengte (km)';
      default:
        return key;
    }
  }
  _removeDrawFromMap()
  {
    if (this.map) {
      this.draw.changeMode(this.drawMode = 'simple_select');
      this.map.off('draw.create', this.featuresCreated);
      this.map.off('draw.selectionchange', this.featuresSelected);
      this.map.off('draw.update', this.featuresUpdated);
      this.map.off('draw.modechange', this.drawModeChange);
      this.map.off('draw.delete', this.drawDelete);
      this.map.getCanvasContainer().removeEventListener('keydown', this.keyDown);
      this._updateMapDrawLayers();
      this._setMapDrawLayersVisibility(true);  
      this.map.removeControl(this.draw);

      this.selectedFeatures = [];
      
      // restore map.boxZoom
      if (this.boxZoomable) {
        this.map.boxZoom.enable();
      } else {
        this.map.boxZoom.disable();
      }
    }
  }
  _drawModeChange(e) {
    this.drawMode = e.mode;
  }
  _keyDown(event) {
    if ((event.srcElement || event.target).classList[0] !== 'mapboxgl-canvas') return; // we only handle events on the map
    if ((event.keyCode === 8 || event.keyCode === 46)) {
      event.preventDefault();
      this.draw.trash();
    } else if (event.keyCode === 49) {
      this.draw.changeMode(this.drawMode = 'draw_point');
    } else if (event.keyCode === 50) {
      this.draw.changeMode(this.drawMode = 'draw_line_string');
    } else if (event.keyCode === 51) {
      this.draw.changeMode(this.drawMode = 'draw_polygon');
    }
  }
  _setSource(layer, features) {
    const source = this.map.getSource(layer.id);
    if (source) {
      source.setData({"type":"FeatureCollection", "features": features});
    } else if (this.sourceRetries > 0) {
      this.sourceRetries--;
      setTimeout(()=>this._setSource(layer, features), 200);
    } else {
      console.log('_setsource failed for layer ' + layer.id);
    }
  }
  _updateMapDrawLayer(layer, typenames) {
    const typedFeatures = this.featureCollection.features
      .filter(feature=>typenames.includes(feature.geometry.type));
    if (typedFeatures.length) {
      if (!this.map.getLayer(layer.id)) {
        this.dispatchEvent(new CustomEvent('addlayer', {
          detail: layer
        }));
      }
    }
    this.sourceRetries = 10;
    this._setSource(layer, typedFeatures);
  }
  _updateMapDrawLayers()
  {
    this.featureCollection = this.draw.getAll();
    this.featureCount = this.featureCollection.features.length;
    this._updateMapDrawLayer(drawPolygons, ["Polygon", "MultiPolygon"]);
    this._updateMapDrawLayer(drawLines, ["LineString", "MultiLineString"]);
    this._updateMapDrawLayer(drawPoints, ["Point", "MultiPoint"]);
  }
  _setMapLayerVisibity(layer, visible) {
    const mapLayer = this.map.getLayer(layer.id);
    if (mapLayer) {
      this.map.setLayoutProperty(layer.id, 'visibility', visible?'visible':'none');
    }
  }
  _setMapDrawLayersVisibility(visible) {
    this._setMapLayerVisibity(drawPolygons, visible);
    this._setMapLayerVisibity(drawLines, visible);
    this._setMapLayerVisibity(drawPoints, visible);
  }
  _setDefaultFeatureProperties(feature) {
    if (!feature.properties.name) {
      this.draw.setFeatureProperty(feature.id, 'name', "");
    }
    switch(feature.geometry.type) {
      case 'Point':
      case 'MultiPoint':
        this.draw.setFeatureProperty(feature.id, 'latitude', feature.geometry.coordinates[1])
        this.draw.setFeatureProperty(feature.id, 'longitude', feature.geometry.coordinates[0])
        break;
      case 'LineString':
      case 'MultiLineString':
        this.draw.setFeatureProperty(feature.id, 'length', turf.length(feature));
        break;
      case 'Polygon':
      case 'MultiPolygon':
        this.draw.setFeatureProperty(feature.id, 'perimeter', turf.length(feature));
        this.draw.setFeatureProperty(feature.id, 'area', turf.area(feature));
        break;
    }
  }
  _updateFeatureProperty(e, feature, key) {
    this.draw.setFeatureProperty(feature.id, key, e.target.value);
    this._setMessage(`'${e.target.value}' opgeslagen`)
  }
  _featuresCreated(e) {
    e.features.forEach(feature=>this._setDefaultFeatureProperties(feature));
    this.featureCount += e.features.length;
  }
  _featuresSelected(e) {
    this.selectedFeatures = [];
    setTimeout(()=>this.selectedFeatures = e.features, 0);
  }
  _featuresUpdated(e) {
    e.features.forEach(feature=>this._setDefaultFeatureProperties(feature));
    this.selectedFeatures = [];
    setTimeout(()=>this.selectedFeatures = e.features, 0);
  }
  _drawDelete(e) {
    this.featureCount -= e.features.length;
    this.selectedFeatures = [];
  }
  _drawCombine(e) {
    this.selectedFeatures = [];
    setTimeout(()=>{
      //e.createdFeatures.forEach(feature=>this._setDefaultFeatureProperties(feature));
      this.selectedFeatures = e.createdFeatures;
    }, 100);
  }
  _drawUncombine(e) {
    this.selectedFeatures = [];
    setTimeout(()=>{
      //e.createdFeatures.forEach(feature=>this._setDefaultFeatureProperties(feature));
      this.selectedFeatures = e.createdFeatures;
    }, 100);
  }
  _downLoad(e) {
    const json = JSON.stringify(this.draw.getAll());
    const blob = new Blob([json], {type: "application/json"});
    window.saveAs(blob, 'edugisdraw.geojson');
  }
  _readFile(file)
  {
    const reader = new FileReader();
    reader.onload = (e) => this._processGeoJson(e.target.result);
    reader.readAsText(file);
  }
  _handleFiles(e) {
    const file = this.querySelector('#fileElem').files[0];
    this._readFile(file);
  }
  _cleanupJson(data) {
    if (data.features) {
      // remove null geometries
      data.features = data.features.filter(feature=>feature.geometry);
    }
  }
  _processGeoJson(data) {
    try {
      const json = JSON.parse(data);
      if (json.type && (json.type == 'Feature' || json.type == 'FeatureCollection')) {
        this._cleanupJson(json)
        const bbox = turf.square(turf.bbox(json));
        const bboxPolygon = turf.bboxPolygon(bbox);
        if (turf.area(bboxPolygon) < 5000) {
          this.map.jumpTo({center: turf.centroid(bboxPolygon).geometry.coordinates, zoom: 20 });
        } else {
          this.map.fitBounds(bbox);
        }
        this.draw.add(json);
        this.featureCount = this.draw.getAll().features.length;
      } else {
        alert ('this json file is not recognized as geojson');
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
  _setMessage(message) {
    if (message !== null && this.timeoutId != null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.message = message;
    if (message !== null) {
      this.timeoutId = setTimeout(()=>this._setMessage(null), 4000)
    }
  }

}
customElements.define('map-draw', MapDraw);
