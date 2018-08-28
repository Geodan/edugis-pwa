
/* 
//see  https://stackoverflow.com/questions/51670987/how-to-import-non-module-javascript-into-polymer-3-0
//import * as mapboxgl from './node_modules/mapbox-gl/dist/mapbox-gl.js';
// load external mapbox-gl.js script
const mapboxgljs = document.createElement('script');
mapboxgljs.setAttribute('src', 'node_modules/mapbox-gl/dist/mapbox-gl.js');
document.head.appendChild(mapboxgljs);
// load external mapbox-gl.css 
const mapboxcss = document.createElement('link');
mapboxcss.setAttribute('href', 'node_modules/mapbox-gl/dist/mapbox-gl.css');
mapboxcss.setAttribute('rel', 'stylesheet');
document.head.appendChild(mapboxcss);
*/

import '../../lib/openmaptiles-language.js';
import './map-data-catalog.js';
import './map-spinner.js';
import './map-coordinates.js';
import './map-layer.js';
import './button-expandable.js';
import './map-legend-container.js';
import './map-measure';
import './map-3d';
import './map-search';

import ZoomControl from '../../lib/zoomcontrol';
import { cloudDownloadIcon } from './my-icons';


function getResolution (map)
{
  // returns degrees / pixel-width
  if (!map) {
    return undefined;
  }
  const y = map._container.clientHeight / 2;
  return getAngle(map.unproject([0, y]), map.unproject([1, y]));
}

function getAngle (latlng1, latlng2)
{
  const rad = Math.PI / 180,
      lat1 = latlng1.lat * rad,
      lat2 = latlng2.lat * rad,
      a = Math.sin(lat1) * Math.sin(lat2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.cos((latlng2.lng - latlng1.lng) * rad);
  return Math.acos(Math.min(a, 1)) / rad;
}

import {LitElement, html} from '@polymer/lit-element';
class WebMap extends LitElement {
  static get properties() { 
    return { 
      mapstyle: String, 
      lon: Number, 
      lat: Number, 
      zoom: Number, 
      navigation: String,
      scalebar: String,
      geolocate: String,
      coordinates: String,
      displaylat: Number,
      displaylng: Number,
      resolution: Number,
      datacatalog: Object,
      layerlist: Array,
      haslegend: Boolean
    }; 
  }
  constructor() {
    super();
    this.map = null;
    this.pitch = 0;
    this.viewbox = undefined;
    // default property values
    this.mapstyle = this.baseURI + "styles/openmaptiles/osmbright.json";
    this.lon = 5.0;
    this.lat = 52.0;
    this.displaylat = this.lat;
    this.displaylng = this.lon;
    this.zoom = 6;
    this.resolution = 0;
    this.navigation = "false";
    this.scalebar = "false";
    this.geolocate = "false";
    this.coordinates = "false";
    this.layerlist = [];
    this.haslegend = false;
  }
  /*_createRoot() {
    // do not create shadowRoot
    return this;
  }*/
  _shouldRender(props, changedProps, prevProps) {
    return true;
  }
  updateLayerVisibility(e) {
    if (this.map) {
      const layer = this.map.getLayer(e.detail.layerid);
      if (layer) {
        layer.setLayoutProperty('visibility', (e.detail.visible ? 'visible' : 'none'));
        this.map._update(true); // TODO: how refresh map wihtout calling private function?
      }
    }
  }
  removeLayer(e) {
    if (this.map) {
      const targetLayer = this.map.getLayer(e.detail.layerid);
      if (targetLayer) {
        const source = targetLayer.source;
        this.map.removeLayer(targetLayer.id);
        const sourceLayers = this.map.getStyle().layers.filter(layer=>layer.source===source);
        if (sourceLayers.length == 0) {
          if (this.map.getSource(source)) {
            this.map.removeSource(source);
          }
        }
        this.layerlist = [...this.map.getStyle().layers];
        this.map._update(true); // TODO: how refresh map wihtout calling private "_update()"?
      }
    }
  }
  addLayer(e) {
    this.map.addLayer(e.detail);
    this.layerlist = [...this.map.getStyle().layers];
  }
  moveLayer(e) {
    console.log(`moving layer ${e.detail.layer} to ${e.detail.beforeLayer}`)
    this.map.moveLayer(e.detail.layer, e.detail.beforeLayer);
    this.layerlist = [...this.map.getStyle().layers];
  }
  updatePitch(e) {
    if (this.map) {
      switch (this.pitch) {
        case 0:
          this.pitch = 60;
          break;
        case 60: 
          this.pitch = 30;
          break;
        case 30:
        default:
          this.pitch = 0;
          break;
      }
      this.map.setPitch(this.pitch);
    }
  }
  fitBounds(e)
  {
    this.map.fitBounds(e.detail.bbox, {maxZoom: 19});
  }
  _render({haslegend, mapstyle, lon, lat, resolution, coordinates, navigation, scalebar, displaylat, displaylng, datacatalog, layerlist}) {
    return html`<style>
      @import "${this.baseURI}node_modules/mapbox-gl/dist/mapbox-gl.css";
      :host {
        display: inline-block;
        min-width: 200px;
        min-height: 200px; 
        overflow: hidden;
      }
      .webmap {width: 100%; height: 100%}
      </style>
    <div class="webmap"></div>
    <map-coordinates visible=${coordinates.toLowerCase() !== "false"} lon=${displaylng} lat=${displaylat} resolution=${resolution}></map-coordinates>
    <map-measure webmap=${this.map} class="centertop"></map-measure>
    <map-3d webmap=${this.map} active="true"></map-3d>
    <map-search viewbox="${this.viewbox}" on-searchclick="${e=>this.fitBounds(e)}"></map-search>
    <button-expandable icon=${cloudDownloadIcon} info="Data catalogus">  
    <map-data-catalog datacatalog=${datacatalog} on-addlayer="${(e) => this.addLayer(e)}"></map-data-catalog>
    </button-expandable>
    <map-legend-container layerlist=${layerlist} visible=${haslegend} on-movelayer="${e=>this.moveLayer(e)}" on-updatevisibility="${(e) => this.updateLayerVisibility(e)}" on-legendremovelayer="${(e) => this.removeLayer(e)}"></map-legend-container>
    <map-spinner webmap=${this.map}></map-spinner>`
  }
  _didRender() {
    ;
  }
  _positionString(prop) {
    // convert prop to control position
    let propl = prop.toLowerCase().trim();
    if (propl === "true" || propl === "") {
      return undefined;
    }
    return propl;
  }
  _firstRendered() {        
    this.map = new mapboxgl.Map({
        container: this.shadowRoot.querySelector('div'), 
        style: this.mapstyle,
        center: [this.lon,this.lat],
        zoom: this.zoom
    });
    
    if (this.navigation.toLowerCase() !== "false") {
      this.map.addControl(new ZoomControl(), this._positionString(this.navigation));
      this.map.addControl(new mapboxgl.NavigationControl(), this._positionString(this.navigation));
    }
    if (this.scalebar.toLowerCase() !== "false") {

      this.map.addControl(new mapboxgl.ScaleControl(), this._positionString(this.scalebar));
    }
    if (this.geolocate.toLowerCase() !== "false") {
      this.map.addControl(new mapboxgl.GeolocateControl(), this._positionString(this.geolocate));
    }
    
    if (this.coordinates.toLowerCase() !== "false") {
      this.map.on('mousemove', e=>{this.displaylat = e.lngLat.lat; this.displaylng = e.lngLat.lng;});
    }
    
    this.map.autodetectLanguage(); // set openmaptiles language to browser language
    this._mapMoveEnd();
    this.map.on('moveend', ()=>{this._mapMoveEnd()});

    this.map.on('load', ()=>{
      this.layerlist = this.map.getStyle().layers;
    });
  }
  _mapMoveEnd() {
    const bounds = this.map.getBounds();
    this.viewbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
    this.resolution = getResolution(this.map);
    this.dispatchEvent(new CustomEvent('moveend', 
      {detail: {
        viewbox: this.viewbox, 
        zoom: this.map.getZoom(),
        bearing: this.map.getBearing(),
        pitch: this.map.getPitch()}
      }
    ));
    this.requestRender();
  }
}
customElements.define('web-map', WebMap);
