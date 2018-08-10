
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

import {LitElement, html} from '@polymer/lit-element';
class WebMap extends LitElement {
  static get properties() { 
    console.log('get properties'); 
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
      layerlist: Array,
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
    this.navigation = "false";
    this.scalebar = "false";
    this.geolocate = "false";
    this.coordinates = "false";
    console.log('constructor');
  }
  /*_createRoot() {
    console.log('_createRoot()');
    return this;
  }*/
  _shouldRender(props, changedProps, prevProps) {
    console.log('_shouldRender(props, changedProps, prevProps)');
    //return (this.map === null);
    return true;
  }
  _render({mapstyle, lon, lat, zoom, navigation, scalebar, displaylat, displaylng, layerlist}) {
    console.log('_render()');
    console.log(layerlist);
    return html`<style>
      @import "../../node_modules/mapbox-gl/dist/mapbox-gl.css";
      :host {
        display: inline-block;
        min-width: 200px;
        min-height: 200px; 
      }
      .webmap {width: 100%; height: 100%}
      .mapcoordinates {
        background-color: rgba(255, 255, 255, 0.75);
        font-size: 12px;
        position: absolute;
        display: inline-block;
        width: 30em;
        bottom: 10px;
        left: 50%;
        margin-left: -15em;
        text-align: center;
        border-radius: 4px;
        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
      }
      
      </style>
    <div class="webmap"></div>
    ${(this.coordinates.toLocaleLowerCase() !== "false") ?
      html`<div class="mapcoordinates">${displaylng}&deg;&#x2194;&nbsp;&nbsp;${displaylat}&deg;&#x2195;</div>`: ''}
    <map-data-catalog layerlist=${layerlist}></map-data-catalog>
    <map-spinner webmap=${this.map}></map-spinner>`;
  }
  _didRender() {
    console.log('_didRender()');
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
    console.log('_firstRendered()');
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
    this._dispatchEventMoveEnd();
    this.map.on('moveend', ()=>{this._dispatchEventMoveEnd()});

    this.shadowRoot.querySelector('map-data-catalog').addEventListener('clicklayer', e=>{
      if (e.detail.on) {
        // add layer
        this.map.addLayer(this.layerlist[2].layerInfo);
      } else {
        // remove layer
        this.map.removeLayer(this.layerlist[2].layerInfo.id);
      }
    });
    this.requestRender();
  }
  _dispatchEventMoveEnd() {
    const bounds = this.map.getBounds();
    this.dispatchEvent(new CustomEvent('moveend', 
      {detail: {
        viewbox: [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()], 
        zoom: this.map.getZoom(),
        bearing: this.map.getBearing(),
        pitch: this.map.getPitch()}
      }
    ));
  }
}
customElements.define('web-map', WebMap);
