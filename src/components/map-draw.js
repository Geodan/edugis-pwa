import {LitElement, html} from '@polymer/lit-element';
import './map-iconbutton';
import {selectIcon, pointIcon, lineIcon, polygonIcon, trashIcon, combineIcon, uncombineIcon, downloadIcon} from './my-icons';

const drawPolygons = {
  "id": "drawPolygons",
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
    "circle-color" : "#FCC",
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
      drawMode: {type: String}
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
    const disableCombine = !this._canCombineFeatures();
    const disableUncombine = !(this.selectedFeatures.length === 1 && this.selectedFeatures[0].geometry.type.startsWith('Multi'));
    return html`
      <style>
      @import "${document.baseURI}node_modules/@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
      .buttoncontainer {display: inline-block; width: 20px; height: 20px; border: 1px solid gray; border-radius:4px;padding:2px;fill:gray;}
      .right {float: right}
      </style>
      <div class="buttoncontainer" @click="${(e)=>this.draw.changeMode(this.drawMode = 'simple_select')}"><map-iconbutton .active="${this.drawMode === 'simple_select' || this.drawMode === 'direct_select'}" info="select" .icon="${selectIcon}"></map-iconbutton></div>
      <div class="buttoncontainer" @click="${(e)=>this.draw.changeMode(this.drawMode = 'draw_point')}"><map-iconbutton .active="${this.drawMode === 'draw_point'}" info="punt" .icon="${pointIcon}"></map-iconbutton></div>
      <div class="buttoncontainer" @click="${(e)=>this.draw.changeMode(this.drawMode = 'draw_line_string')}"><map-iconbutton .active="${this.drawMode === 'draw_line_string'}" info="lijn" .icon="${lineIcon}"></map-iconbutton></div>
      <div class="buttoncontainer" @click="${(e)=>this.draw.changeMode(this.drawMode = 'draw_polygon')}"><map-iconbutton info="vlak" .active="${this.drawMode === 'draw_polygon'}" .icon="${polygonIcon}"></map-iconbutton></div>
      <div class="buttoncontainer" @click="${(e)=>!disableDelete && this.draw.trash()}"><map-iconbutton .disabled="${disableDelete}" info="verwijder" .icon="${trashIcon}"></map-iconbutton></div>
      <div class="buttoncontainer" @click="${(e)=>!disableCombine && this.draw.combineFeatures()}"><map-iconbutton info="groepeer" .disabled="${disableCombine}" .icon="${combineIcon}"></map-iconbutton></div>
      <div class="buttoncontainer" @click="${(e)=>!disableUncombine && this.draw.uncombineFeatures()}"><map-iconbutton info="splits" .disabled="${disableUncombine}" .icon="${uncombineIcon}"></map-iconbutton></div>
      ${window.saveAs ? html`<div class="buttoncontainer right" @click="${(e)=>this.featureCount > 0 && this._downLoad()}"><map-iconbutton info="opslaan" .disabled="${this.featureCount === 0}" .icon="${downloadIcon}"></map-iconbutton></div>`: ''}
      ${this.selectedFeatures.map(feature=>{
        return Object.keys(feature.properties).map(key=>html`
          <hr>${key}<br><input type="text" @input="${(e)=>this._updateFeatureProperty(e, feature, key)}" value="${feature.properties[key]}">\n`
          );
      })}
    `
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
      this.map.addControl(this.draw, 'bottom-right');
      if (this.featureCollection.features.length) {
        this.draw.set(this.featureCollection);
        this.featureCount = this.featureCollection.features.length;
      }
      this.map.on('draw.create', this.featuresCreated = (e)=>this._featuresCreated(e));
      this.map.on('draw.selectionchange', this.featuresSelected = (e)=>this._featuresSelected(e));
      this.map.on('draw.update', this.featuresUpdated = (e)=>this._featuresUpdated(e));
      this.map.on('draw.modechange', this.drawModeChange = (e)=>this._drawModeChange(e));
      this.map.on('draw.delete', this.drawDelete = (e)=>this._drawDelete(e));
      this.map.on('draw.combine', this.drawCombine = (e)=>this._drawCombine(e));
      this.map.on('draw.uncombine', this.drawUncombine = (e)=>this._drawUncombine(e));
      this.keyDownBound = this._keyDown.bind(this);
      this.map.getCanvasContainer().addEventListener('keydown', this.keyDown=(e)=>this._keyDown(e));
    }
  }
  _removeDrawFromMap()
  {
    if (this.map) {
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
  _updateMapDrawLayer(layer, typenames) {
    const typedFeatures = this.featureCollection.features
      .filter(feature=>typenames.includes(feature.geometry.type));
    if (typedFeatures.length) {
      if (!this.map.getLayer(layer.id)) {
        this.map.addLayer(layer)
      }
    }
    const source = this.map.getSource(layer.id);
    if (source) {
      source.setData({"type":"FeatureCollection", "features": typedFeatures});
    }
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
  }
  _drawDelete(e) {
    console.log('delete')
    console.log(e.features);
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
}
customElements.define('map-draw', MapDraw);
