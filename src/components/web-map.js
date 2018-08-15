
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

import './openmaptiles-language.js';
import './map-data-catalog.js';
import './map-spinner.js';
import './map-coordinates.js';
import './map-layer.js';
import './button-expandable.js';
import './map-legend-container.js';
import { databaseIcon } from './my-icons.js';


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
    // default property values
    this.mapstyle = "../../styles/openmaptiles/positronworld.json";
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
    return this;
  }*/
  _shouldRender(props, changedProps, prevProps) {
    return true;
  }
  _render({haslegend, mapstyle, lon, lat, resolution, coordinates, navigation, scalebar, displaylat, displaylng, datacatalog, layerlist}) {
    return html`<style>
      @import "../../node_modules/mapbox-gl/dist/mapbox-gl.css";
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
    <button-expandable icon=${databaseIcon} info="Data catalogus">  
    <map-data-catalog datacatalog=${datacatalog}></map-data-catalog>
    </button-expandable>
    <map-legend-container layerlist=${layerlist} visible=${haslegend}></map-legend-container>
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

    this.shadowRoot.querySelector('map-data-catalog').addEventListener('addlayer', e=>{
      if (e.detail) {
        // add layer
        this.map.addLayer(e.detail);
        this.layerlist = [...this.map.getStyle().layers];
      } 
    });
    this.map.on('load', ()=>{
      this.layerlist = this.map.getStyle().layers;
    });
  }
  _mapMoveEnd() {
    const bounds = this.map.getBounds();
    this.resolution = getResolution(this.map);
    this.dispatchEvent(new CustomEvent('moveend', 
      {detail: {
        viewbox: [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()], 
        zoom: this.map.getZoom(),
        bearing: this.map.getBearing(),
        pitch: this.map.getPitch()}
      }
    ));
    this.requestRender();
  }
}
customElements.define('web-map', WebMap);
