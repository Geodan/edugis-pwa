import {LitElement, html, css} from 'lit-element';
import './map-iconbutton';
import {selectIcon, pointIcon, lineIcon, polygonIcon, trashIcon, checkIcon, combineIcon, uncombineIcon, downloadIcon, openfileIcon, threeDIcon} from './my-icons';
import drawStyle from './map-draw-theme.js';
import drawCss from './map-draw-css.js';

function _uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const translate = {
  "number": "getal",
  "string": "tekst",
  "longitude": "lengtegraad",
  "latitude": "breedtegraad",
  "length": "lengte",
  "perimeter": "omtrek",
  "area": "oppervlak",
  "name":"naam",
  "type":"soort",
  "Point": "Punt",
  "Line": "Lijn",
  "Polygon": "Vlak"
};

function trl(word) {
  return translate[word] ? translate[word] : word;
}

const propertyTypes ={
  "Point":  ["string", "number", "longitude", "latitude"],
  "Line": ["string", "number", "length"],
  "Polygon": ["string", "number", "longitude", "latitude", "perimeter", "area"]
}

const defaultProperties = [
  {name: "id", type: "number"},
  {name: "name", type: "string"}
]

const newLayers = {
  Polygon: {
    "id": "drawPolygons",
    "metadata": {
      "title": "Getekende vlakken",
      "attributes": {
        "translations": [
          {"name": "name", "tanslation": "naam"}
        ]
      },
      "properties": defaultProperties.map(prop=>({name: prop.name, type: prop.type}))
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
  },
  Line: {
    "id": "drawLines",
    "metadata": {
      "title": "Getekende lijnen",
      "attributes": {
        "translations": [
          {"name": "name", "tanslation": "naam"}
        ]
      },
      "properties": defaultProperties.map(prop=>({name: prop.name, type: prop.type}))
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
  },
  Point : {
    "id": "drawPoints",
    "metadata": {
      "title": "Getekende punten",
      "attributes": {
        "translations": [
          {"name": "name", "tanslation": "naam"}
        ]
      },
      "properties": defaultProperties.map(prop=>({name: prop.name, type: prop.type}))
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
};


/**
* @polymer
* @extends HTMLElement
*/
class MapDraw2 extends LitElement {
  static get properties() { 
    return {
      active: {type: Boolean},
      map: {type: Object},
      selectedFeatures: {type: Array},
      drawMode: {type: String},
      message: {type: String}
    }; 
  }
  createRenderRoot() {
    return this; // do not use shadowRoot
  }
  static get styles() {
    // this doesn't work, because mapbox-gl is not using shadowRoot
    // mapbox-gl-draw needs to access DOM elements outside the shadowRoot
    return css`
    `;
  }
  constructor() {
      super();
      this.map = null;
      this.active = false;
      this.selectedFeatures = [];
      this.drawMode = 'simple_select';
      this.featureType = 'None';
      this.featureCollection = {"type": "FeatureCollection", "features": []};
      this.message = null;
      this.timeoutId = null;
      this.currentEditLayer = null;
      this.snapLayers = [];
      this.editableLayers = {Point:[],Line:[],Polygon:[]};
      this.lastEditedLayer = {Point: null, Line: null, Polygon: null};
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
  _renderSelectedFeatures() {
    if (this.selectedFeatures.length === 0) {
      return html``;
    }
    const currentEditLayer = this.currentEditLayer;
    return html`
    <div id="selectedfeatures">
      <div>Geselecteerd ${trl(this._currentGeometryType())}:</div>
      <table id="selectedproperties">
        ${this.selectedFeatures.map(feature=>{
          return Object.keys(feature.properties).map(key=>html`
            <tr><td class="propertyname">${trl(key)}</td>
              <td><input ?disabled=${key==="id" || !["string","number"].includes(currentEditLayer.metadata.properties.find(attr=>attr.name===key).type)} type="text" @input="${(e)=>this._updateFeatureProperty(e, feature, key)}" value="${this.draw.get(feature.id).properties[key]}"></td>
            </tr>`
          );
        })}
      </table>
    </div>`
  }
  _inSelectMode() {
    return ['simple_select','direct_select'].includes(this.draw.getMode())
  }
  render() {
    if (!this.active) {
      return html``;
    }
    const showSelect = this.featureType !== 'None' && !this._isTempLayer(this.currentEditLayer.id);
    return html`
      <style>
      ${drawCss}
      .drawcontainer {font-size:14px;}
      .header {font-weight: bold; padding-bottom:10px; padding-top: 10px; border-bottom: 1px solid lightgray;}
      .right {float: right; margin-left: 4px;}
      .dropzone {display: inline-block; height: 24px; width: 210px; border: 1px dashed gray; border-radius: 2px;}
      .dragover {background-color: lightgray;} 
      .buttonbar {font-size: 0;}
      .buttoncontainer {display: inline-block; box-sizing: border-box; width: 55px; height: 55px; line-height:75px;fill:darkgray;}
      .message {background-color: rgba(146,195,41,0.98);width: 100%;box-shadow: 2px 2px 4px 0; height: 36px; color: white; font-weight: bold; line-height: 36px;padding: 2px;}
      .iconcontainer {display: inline-block; width: 24px; height: 24px; fill: white; margin: 5px; vertical-align: middle;}
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
      button {
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
      .layertype {
        display: inline-block;
        font-weight: bold;
      }
      td input {
        max-width: calc(100% - 10px);
      }
      </style>
      <div class="drawcontainer" @dragover="${e=>e.preventDefault()}">
      <div class="header">Tekenen</div>
      <div>${this.featureType === 'None'? 'Kies soort figuur (punt, lijn of vlak):':`${this._inSelectMode()?'Selecteer ':'Teken '} ${trl(this.featureType)}`}</div>
      <div class="buttonbar">
      <div class="buttoncontainer" @click="${(e)=>this._changeMode('draw_point')}" title="[1]"><map-iconbutton .active="${this.featureType === 'Point'}" info="teken punt" .icon="${pointIcon}"></map-iconbutton></div>
      <div class="buttoncontainer" @click="${(e)=>this._changeMode('draw_line_string')}" title="[2]"><map-iconbutton .active="${this.featureType === 'Line'}" info="teken lijn" .icon="${lineIcon}"></map-iconbutton></div>
      <div class="buttoncontainer" @click="${(e)=>this._changeMode('draw_polygon')}" title="[3]" ><map-iconbutton info="teken vlak" .active="${this.featureType === 'Polygon'}" .icon="${polygonIcon}"></map-iconbutton></div>
      ${showSelect?html`
      <div class="buttoncontainer" @click="${(e)=>this._setMode('simple_select')}" title="[ESC]" ><map-iconbutton info="selecteer ${trl(this.featureType).toLowerCase()}" .active="${this._inSelectMode()}" .icon="${selectIcon}"></map-iconbutton></div>
      ` : html``}
      </div>
      ${this._renderEditLayerInfo()}
      ${this._renderSelectedFeatures()}
      ${this._renderMessage()}
      </div>
    `
  }
  _getType(mode){
    switch (mode) {
      case 'draw_point':
        return 'Point'
      case 'draw_line_string':
        return 'Line'
      case 'draw_polygon':
        return 'Polygon'
      default:
        return 'None'
    }
  }
  _layerType(drawMode) {
    const mode = this._getType(drawMode);
    switch(mode) {
      case 'Point': 
        return 'circle';
      case 'Line':
        return 'line';
      case 'Polygon':
        return 'fill';
    }
  }
  _layerExists(id) {
    if (this.editableLayers[this.featureType].find((layer)=>layer.id===id)) {
      return true;
    }
    return false;
  }
  _updateCurrentLayerInfo() {
    const type = this.featureType;
    // get list of editable layers for this type
    const layerTypes = {
      "Point":["circle", "symbol"],
      "Line": ["line"],
      "Polygon": ["fill","fill-extrusion"]
    }
    this.editableLayers[type] = this.map.getStyle().layers
      .filter(layer=>layerTypes[type].includes(layer.type) && !layer['source-layer'] && layer.metadata && !layer.metadata.isToolLayer);
    this.editableLayers[type].push(JSON.parse(JSON.stringify(newLayers[type])));
    this.editableLayers[type].reverse();

    if (this.currentEditLayer !== null) {
      if (this.lastEditedLayer[type] === null || this.lastEditedLayer[type].id !== this.currentEditLayer.id) {
        // apparently switching to new layer, store updates
        this._updateMapLayer(this.currentEditLayer);
      }
    }
    if (this.lastEditedLayer[type]) {
      if (this.currentEditLayer === null || this.currentEditLayer.id !== this.lastEditedLayer[type].id) {
        this.currentEditLayer = this.lastEditedLayer[type];
        if (this._layerExists(this.currentEditLayer.id)) {
          this._updateDrawLayer(this.currentEditLayer);
        } else {
          this.currentEditLayer = this.editableLayers[type][0];
          this._updateDrawLayer(this.currentEditLayer);
        }
      }
    } else {
      this.currentEditLayer = this.editableLayers[type][0];
      this._updateDrawLayer(this.currentEditLayer);
    }
  }
  _changeMode(newMode) {
      this.drawMode = newMode;
      this.featureType = this._getType(newMode);
      this._updateCurrentLayerInfo();
      this._setMode(newMode);
  }
  _setMode(newMode) {
    this.draw.changeMode(newMode);
    this.requestUpdate();
  }
  _currentGeometryType() {
    let mode = this.drawMode;
    if (mode === 'simple_select' || mode === 'direct_select') {
      if (this.selectedFeatures.length > 0) {
        switch (this.selectedFeatures[0].geometry.type) {
          case 'Point':
          case 'MultiPoint':
            mode = 'draw_point';
            break;
          case 'LineString':
          case 'MultiLineString':
            mode = 'draw_line_string';
            break;
          case 'Polygon':
          case 'MultiPolygon':
            mode = 'draw_polygon';
            break;
        }
      }
    }
    return this._getType(mode);
  }
  _renderActiveLayerDropdown(currentGeometryType) {
    //const id = this.lastEditedLayer[currentGeometryType] ? this.lastEditedLayer[currentGeometryType].id : newLayers[currentGeometryType].id;
    const id = this.currentEditLayer.id;
    const title = this.currentEditLayer.metadata.title;
    return this.editableLayers[currentGeometryType]
      .map(layer=>html`<option ?selected=${layer.id===id} value="${layer.id}">${layer.id===id?title:layer.metadata.title}</option>`)
  }
  _prepareLayerForDraw(layer) {
    let id = 1;
    if (!layer.metadata.hasOwnProperty('properties')) {
      const properties = new Map();
      const source = this.map.getSource(layer.id).serialize();
      for (const feature of source.data.features) {
        if (!feature.properties.hasOwnProperty('id')) {
          feature.properties.id = id++;
        }
        for (const propname in feature.properties) {
          if (!properties.has(propname)) {
            if (typeof feature.properties[propname] === 'number') {
              properties.set(propname, 'number');
            } else {
              properties.set(propname, 'string');
            }
          }
        }
      }
      layer.metadata.properties = [{"name": "id", "type": "number"}];
      for (const [key,value] of properties) {
        if (key !== 'id') {
          layer.metadata.properties.push({"name": key, "type": value});
        }
      }
    }
  }
  _layerDropDownChange(event) {
    const selectedLayerId = this.querySelector('select option:checked').value;
    const type = this.featureType;
    const layer = this.editableLayers[type].find(layer=>layer.id === selectedLayerId);
    this._prepareLayerForDraw(layer);
    this.lastEditedLayer[type] = layer;
    this._changeMode(this.drawMode);
    //this._updateCurrentLayerInfo();
    this.requestUpdate();
  }
  _removeProperty(event, idx) {
    this.currentEditLayer.metadata.properties.splice(idx,1);
    this.requestUpdate();
  }
  _addProperty(event) {
    const propertyName = this.querySelector('#propertyName').value;
    const propertyType = this.querySelector('#propertyType').value;
    if (propertyName.trim() === "") {
      return;
    }
    this.currentEditLayer.metadata.properties.push({name: propertyName, type: propertyType});
    this.querySelector('#propertyName').value = "";
    this.querySelector('#propertyType').options[0].selected = true;
    this.requestUpdate();
  }
  _layerTitleUpdate(event) {
    const newTitle = event.target.value.trim();
    if (newTitle !== '') {
      this.currentEditLayer.metadata.title = newTitle;
      const layer = this.map.getLayer(this.currentEditLayer.id);
      if (layer) {
        layer.metadata.title = newTitle;
      }
    }
    this.requestUpdate();
  }
  _layerTitleChange(event) {
    // notify application that layer title has changed
    this.dispatchEvent(new CustomEvent('titlechange', {
      detail: {
        layerid: this.currentEditLayer.id,
        title: this.currentEditLayer.metadata.title
      }
    }))
  }
  _renderEditLayerInfo() {
    const featureType = this.featureType;
    if (featureType == 'None') {
        return html``;
    }
    if (this.selectedFeatures.length > 0) {
      return html`<div class="layertype">kaartlaag: ${this.currentEditLayer.metadata.title}</div>`;
    }
    return html`
      <hr>
      <div class="layertype">${this._inSelectMode()?'Selecteer':'Teken'} ${trl(featureType)}</div>
      <div class="layerselect">Kaartlaag: <select @change="${(e)=>this._layerDropDownChange(e)}">${this._renderActiveLayerDropdown(featureType)}</select></div>
      <div>Laagnaam: <input type="text" 
        @input="${e=>this._layerTitleUpdate(e)}" 
        @change="${e=>this._layerTitleChange(e)}"
        .value="${this.currentEditLayer.metadata.title}">
      </div>
      <div>
        <div>${trl(featureType)} eigenschappen:</div>
        <div>
          <table id="propertytable">
            <tr><th>${trl('name')}</th><th>${trl('type')}</th><th class="btncolumn"></th></tr>
            ${this.currentEditLayer.metadata.properties.map((property,idx)=>html`<tr><td>${trl(property.name)}</td><td>${trl(property.type)}</td><td>${idx===0?'':html`<button @click="${(e)=>this._removeProperty(e, idx)}">-</button>`}</td></tr>`)}
            <tr>
              <td><input id="propertyName" type="text" placeholder="eigenschap"></td>
              <td>
                <select id="propertyType">
                  ${propertyTypes[featureType].map((type, idx)=>html`<option ?selected=${idx===0} value="${type}">${trl(type)}</option>`)}
                </select>
              </td>
              <td><button @click="${(event)=>this._addProperty(event)}">+</button></tr>
          </table>
        </div>
      </div>
    `
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
  _setSnapLayers() {
    const layerTypes = {
      "Point":["circle", "symbol"],
      "Line": ["line"],
      "Polygon": ["fill","fill-extrusion"]
    }
    const drawSnapLayers = new Set(this.draw.options.snapLayers);
    const mapSnapLayers = this.map.getStyle().layers
      .filter(layer=>
        (layerTypes.Point.includes(layer.type) ||
        layerTypes.Line.includes(layer.type) ||
        layerTypes.Polygon.includes(layer.type)) 
          && !layer['source-layer'] && layer.metadata && !layer.metadata.isToolLayer)
      .map(layer=>layer.id);
    mapSnapLayers.forEach(layer=>drawSnapLayers.add(layer));
    this.draw.options.snapLayers = Array.from(drawSnapLayers);
  }
  _addDrawToMap(){ 
    if (this.map) {
      // store map.boxZoom
      this.boxZoomable = this.map.boxZoom.isEnabled();
      this.draw = new MapboxDraw({
        displayControlsDefault: true,
        keybindings: true,
        controls: {point: false, line_string: false, polygon: false, trash: false, combine_features: false, uncombine_features: false},
        styles: drawStyle
      });
      this._setSnapLayers();
      this.draw.options.styles.forEach(style=>style.metadata = {isToolLayer: true});
      this.map.addControl(this.draw, 'bottom-right');
      this.map.on('draw.create', this.featuresCreated = (e)=>this._featuresCreated(e));
      this.map.on('draw.selectionchange', this.featuresSelected = (e)=>this._featuresSelected(e));
      this.map.on('draw.update', this.featuresUpdated = (e)=>this._featuresUpdated(e));
      this.map.on('draw.modechange', this.drawModeChange = (e)=>this._drawModeChange(e));
      this.map.on('draw.delete', this.drawDelete = (e)=>this._drawDelete(e));
      this.map.on('draw.combine', this.drawCombine = (e)=>this._drawCombine(e));
      this.map.on('draw.uncombine', this.drawUncombine = (e)=>this._drawUncombine(e));
      this.keyDownBound = this._keyDown.bind(this);
      this.map.getCanvasContainer().addEventListener('keydown', this.keyDown=(e)=>this._keyDown(e));
      this.map.getCanvas().style.cursor = "unset"; // let mapbox-gl-draw handle the cursor
      setTimeout(()=>this.draw.changeMode(this.drawMode = 'simple_select'), 100);
    }
  }
  _removeDrawFromMap()
  {
    if (this.map) {
      if (this.draw) {
        this.draw.changeMode(this.drawMode = 'simple_select');
      }
      this._updateMapLayer(this.currentEditLayer);
      this.currentEditLayer = null;
      this.featureType = 'None';
      this.map.off('draw.create', this.featuresCreated);
      this.map.off('draw.selectionchange', this.featuresSelected);
      this.map.off('draw.update', this.featuresUpdated);
      this.map.off('draw.modechange', this.drawModeChange);
      this.map.off('draw.delete', this.drawDelete);
      this.map.getCanvasContainer().removeEventListener('keydown', this.keyDown);
      //this._updateMapDrawLayers();
      //this._setMapDrawLayersVisibility(true);  
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
    //this.drawMode = e.mode;
  }
  _keyDown(event) {
    if ((event.srcElement || event.target).classList[0] !== 'mapboxgl-canvas') return; // we only handle events on the map
    if ((event.keyCode === 8 || event.keyCode === 46)) {
      event.preventDefault();
      this.draw.trash();
    } else if (event.keyCode === 49) {
      this._changeMode('draw_point');
    } else if (event.keyCode === 50) {
      this._changeMode('draw_line_string');
    } else if (event.keyCode === 51) {
      this._changeMode('draw_polygon');
    }
  }
  _isTempLayer(id) {
    return ['drawPoints','drawLines','drawPolygons'].includes(id);
  }
  _isValidFeature(feature, type) {
    if (feature.geometry.coordinates === null) {
      console.log('null');
      return false;
    }
    if (feature.geometry.coordinates.length === 0) {
      console.log('[]');
      return false;
    }
    if (feature.geometry.coordinates.length === 1) {
      if (feature.geometry.coordinates[0] === null) {
        console.log('[null]');
        return false;
      }
      if (feature.geometry.coordinates[0].length === 0) {
        console.log('[[]]')
        return false;
      }
      if (feature.geometry.coordinates[0][0] === null) {
        console.log('[[null]]')
        return false;
      }
    }
    return true;
  }
  _updateMapLayer(layer) {
    if (!layer || this._isTempLayer(layer.id)) {
      return;
    }
    const featureCollection = this.draw.getAll();
    featureCollection.features = featureCollection.features.filter(this._isValidFeature, this.featureType)
    const source = this.map.getSource(layer.id);
    if (source) {
      this.draw.deleteAll();
      this.selectedFeatures = [];
      console.log(`adding ${featureCollection.features.length} elements to layer`);
      source.setData(JSON.parse(JSON.stringify(featureCollection)));
      this._setMapLayerVisibity(layer.id, true);
    } else {
      console.log('_updateMapLayer failed for layer ' + layer.id);
    }
  }
  _updateDrawLayer(layer) {
    this.draw.deleteAll();
    if (!layer || this._isTempLayer(layer.id)){
      return;
    }
    const source = this.map.getSource(layer.id);
    if (source) {
      const sourceData = source.serialize();
      if (sourceData) {
        const featureCollection = sourceData.data;
        this.draw.set(featureCollection);
        this._setMapLayerVisibity(layer.id, false);
      }
    } else {
      console.error(`could not get source for ${layer.id}`)
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
  _setMapLayerVisibity(layerid, visible) {
    const mapLayer = this.map.getLayer(layerid);
    if (mapLayer) {
      //this.map.setLayoutProperty(layer.id, 'visibility', visible?'visible':'none');
      this.dispatchEvent(new CustomEvent('updatevisibility', {
        detail: {
          layerid: layerid,
          visible: visible
        }
      }));
    }
  }
  _defaultPropertyValue(type, feature) {
    switch (type) {
      case 'number':
      case 'string':
        return null;
      case 'longitude':
        return turf.centroid(feature).geometry.coordinates[0];
      case 'latitude':
        return turf.centroid(feature).geometry.coordinates[1];
      case 'perimeter':
      case 'length':
        return turf.length(feature);
      case 'area':
        return turf.area(feature);
    }
  }
  _getUniqueFeatureId(){
    const featureCollection = this.draw.getAll();
    let result = 1;
    for (const feature of featureCollection.features) {
      const featureId = parseInt(feature.properties.id);
      if (feature.properties.id && result <= featureId) {
        result = featureId + 1;
      }
    }
    return result;
  }
  _setDefaultFeatureProperties(feature) {
    const newId = this._getUniqueFeatureId();
    this.currentEditLayer.metadata.properties.forEach((property,idx)=>{
      if (idx === 0) {
        this.draw.setFeatureProperty(feature.id, property.name, newId);
      } else {
        this.draw.setFeatureProperty(feature.id, property.name, this._defaultPropertyValue(property.type, feature))
      }
    });
  }
  _updateFeatureAutoProperties(feature) {
    this.currentEditLayer.metadata.properties.forEach((property)=>{
      const value = this._defaultPropertyValue(property.type, feature);
      if (value) {
        this.draw.setFeatureProperty(feature.id, property.name, value);
      }
    });
    this.requestUpdate();
  }
  _updateFeatureProperty(e, feature, key) {
    this.draw.setFeatureProperty(feature.id, key, e.target.value);
    this._setMessage(`'${e.target.value}' opgeslagen`)
  }
  _addNewLayerOption() {
    let featureTypeString = this.featureType === 'Point' ? '(punten)' : this.featureType === 'Line' ? ('lijnen') : '(vlakken)';
    let title = `Nieuwe kaartlaag ${featureTypeString}`;
    let layers = this.map.getStyle().layers;
    if (layers.find(layer=>layer.metadata.title === title)) {
      let counter = 1;
      do {
        title = `Nieuwe kaartlaag_${counter++} ${featureTypeString}`;
      } while (layers.find(layer=>layer.metadata.title === title));
    }
    newLayers[this.featureType].metadata.title = title;
    this.editableLayers[this.featureType].unshift(JSON.parse(JSON.stringify(newLayers[this.featureType])));
    this._updateCurrentLayerInfo();
  }
  _featuresCreated(e) {
    e.features.forEach(feature=>this._setDefaultFeatureProperties(feature));
    if (this._isTempLayer(this.currentEditLayer.id)) {
      // element created in temp layer, make temp layer permanent
      this.currentEditLayer.id = _uuidv4();
      this.lastEditedLayer[this.featureType] = this.currentEditLayer;
      
      this.dispatchEvent(new CustomEvent('addlayer', 
        {detail: this.currentEditLayer}
      ));
      this.dispatchEvent(new CustomEvent('movelayer', {
        detail: { 
          layers: [this.currentEditLayer.id],
          beforeLayer: "gl-draw-polygon-fill-inactive.cold"
        }
      }));
      this._addNewLayerOption();
    }
  }
  _featuresSelected(e) {
    this.selectedFeatures = e.features;
    // check if any newly defined layer properties should be added to the feature
    for (const prop of this.currentEditLayer.metadata.properties) {
      for (const feature of this.selectedFeatures) {
        if (!feature.properties.hasOwnProperty(prop.name)) {
          const value = this._defaultPropertyValue(prop.type, feature);
          this.draw.setFeatureProperty(feature.id, prop.name, value);
          feature.properties[prop.name] = value; // update internal copy as well
        }
      }
    }
  }
  _featuresUpdated(e) {
    e.features.forEach(feature=>this._updateFeatureAutoProperties(feature));
    this.selectedFeatures = [];
    setTimeout(()=>this.selectedFeatures = e.features, 0);
  }
  _drawDelete(e) {
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
customElements.define('map-draw2', MapDraw2);
