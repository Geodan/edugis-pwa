import {LitElement, html} from '@polymer/lit-element';
import './map-iconbutton';
import {pointIcon, lineIcon, polygonIcon, trashIcon, combineIcon, uncombineIcon} from './my-icons';

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
      selectedFeatures: {type: Array}
    }; 
  }
  constructor() {
      super();
      this.map = null;
      this.active = false;
      this.selectedFeatures = [];
      this.featureCollection = {"type": "FeatureCollection", "features": []};
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
  render() {
    return html`
      <style>
      @import "${document.baseURI}node_modules/@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
      .buttoncontainer {display: inline-block; width: 20px; height: 20px; border: 1px solid gray; border-radius:4px;padding:2px;fill:gray;}
      </style>
      <div class="buttoncontainer" @click="${(e)=>this.draw.changeMode('draw_point')}"><map-iconbutton info="punt" .icon="${pointIcon}"></map-iconbutton></div>
      <div class="buttoncontainer" @click="${(e)=>this.draw.changeMode('draw_line_string')}"><map-iconbutton info="lijn" .icon="${lineIcon}"></map-iconbutton></div>
      <div class="buttoncontainer" @click="${(e)=>this.draw.changeMode('draw_polygon')}"><map-iconbutton info="vlak" .icon="${polygonIcon}"></map-iconbutton></div>
      <div class="buttoncontainer"><map-iconbutton info="verwijder" .icon="${trashIcon}"></map-iconbutton></div>
      <div class="buttoncontainer"><map-iconbutton info="groepeer" .icon="${combineIcon}"></map-iconbutton></div>
      <div class="buttoncontainer"><map-iconbutton info="splits" .icon="${uncombineIcon}"></map-iconbutton></div>
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
        displayControlsDefault: false
      });
      this.map.addControl(this.draw, 'bottom-right');
      if (this.featureCollection.features.length) {
        this.draw.set(this.featureCollection);
      }
      this.map.on('draw.create', (e)=>this._featuresCreated(e));
      this.map.on('draw.selectionchange', (e)=>this._featuresSelected(e));
      this.map.on('draw.update', (e)=>this._featuresUpdated(e));
    }
  }
  _removeDrawFromMap()
  {
    if (this.map) {
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
        this.draw.setFeatureProperty(feature.id, 'latitude', feature.geometry.coordinates[1])
        this.draw.setFeatureProperty(feature.id, 'longitude', feature.geometry.coordinates[0])
        break;
      case 'LineString':
        this.draw.setFeatureProperty(feature.id, 'length', turf.length(feature));
        break;
      case 'Polygon':
        this.draw.setFeatureProperty(feature.id, 'perimeter', turf.length(feature));
        this.draw.setFeatureProperty(feature.id, 'area', turf.area(feature));
        break;
    }
  }
  _updateFeatureProperty(e, feature, key) {
    this.draw.setFeatureProperty(feature.id, key, e.target.value);
  }
  _featuresCreated(e) {
    console.log('created');
    e.features.forEach(feature=>this._setDefaultFeatureProperties(feature));
    console.log(e.features);
  }
  _featuresSelected(e) {
    console.log('selected');
    this.selectedFeatures = [];
    setTimeout(()=>this.selectedFeatures = e.features, 0);
    console.log(e.features);
  }
  _featuresUpdated(e) {
    console.log('updated');
    e.features.forEach(feature=>this._setDefaultFeatureProperties(feature));
    console.log(e.features);
  }
}
customElements.define('map-draw', MapDraw);
