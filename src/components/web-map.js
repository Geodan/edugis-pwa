
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
import './button-expandable.js';
import './map-legend-container.js';
import './map-measure';
import './map-language';
import './map-search';
import './map-button-ctrl';
import './map-dialog';
import './map-gsheet-form';
import './map-info-formatted';
import './map-panel';
import './map-geolocation';
import './map-pitch';
import './map-selected-layers';

import ZoomControl from '../../lib/zoomcontrol';
import { gpsFixedIcon, languageIcon, arrowLeftIcon } from './my-icons';
import { measureIcon, informationIcon as gmInfoIcon, layermanagerIcon, drawIcon, searchIcon as gmSearchIcon } from '../gm/gm-iconset-svg';


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

let searchGeoJson = {
  "type": "FeatureCollection",
  "features": []
}
const searchSource = { 
  "type" : "geojson",
  "data" : searchGeoJson
};
const searchLines = {        
  "id": "map-search-line",
  "type": "line",
  "source": "map-search-geojson",
  "layout": {
      "line-join": "round",
      "line-cap": "round"
  },
  "paint": {
      "line-color": "#c30",
      "line-width": 3
  },
  "filter": ['in', '$type', 'LineString']
};
const searchPoints ={
  "id": "map-search-points",
  "type": "symbol",
  "source": "map-search-geojson",            
  "layout": {                        
    "icon-image": "{icon}",
    "text-field": "{name}",
    "text-font": ["Noto Sans Regular"],
    "text-offset": [0, 0.6],
    "text-anchor": "top",
    "text-size": 14,
    "text-rotation-alignment": "map",
    "text-ignore-placement": true,
    "text-allow-overlap": true,
    "icon-allow-overlap": true
  },
  "paint": {
    "text-color": "#000",
    "text-halo-color": "#fff",
    "text-halo-width": 1
  },
  "filter": ['==', '$type', 'Point']
};
const searchSurface = {
  "id": "map-search-surface",
  "type": "fill",
  "source": "map-search-geojson",
  "layout": {
    "visibility": "visible"
  },
  "paint": {
    "fill-color": "#c30",
    "fill-opacity": 0.4
  },
  "filter": ['==', '$type', "Polygon"],
};

let StaticMode = {
  onSetup :  function() {
    this.setActionableState(); // default actionable state is false for all actions
    return {};
  },
  toDisplayFeatures : function(state, geojson, display) {
    display(geojson);
  }
}

// srs optional, defaults to 'EPSG:3857'
// adds projected .x and .y properties to lngLat
function projectLngLat(lngLat, srs)
{
    if (!srs) {
        srs = 'EPSG:3857';
    }
    var project = proj4('EPSG:4326', srs);
    var p = project.forward({x: lngLat.lng, y: lngLat.lat});    
    lngLat.x = p.x;
    lngLat.y = p.y;
    return lngLat;
}

import {LitElement, html} from '@polymer/lit-element';
/**
* @polymer
* @extends HTMLElement
*/
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
      haslegend: Boolean,
      accesstoken: String,
      lastClickPoint: Object,
      currentTool: String
    }; 
  }
  constructor() {
    super();
    this.map = null;
    this.pitch = 0;
    this.viewbox = undefined;
    // default property values
    this.mapstyle = this.baseURI + "styles/openmaptiles/osmbright.json";
    this.mapstyleid = "OsmBright";
    this.mapstyletitle = "OSM bright (stijl)";
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
    this.accesstoken = undefined;
    this.lastClickPoint = undefined;
    this.currentTool = '';
  }
  updateSingleLayerVisibility(id, visible) {
    const layer = this.map.getLayer(id);
    if (layer) {
      layer.setLayoutProperty('visibility', (visible ? 'visible' : 'none'));
      // update item in this.layerlist
      const layerlistitem = this.layerlist.find(layerlistitem=>layerlistitem.id===id);
      layerlistitem.layervisible = visible;
    }
  }
  updateLayerVisibility(e) {
    if (this.map) {
      if (Array.isArray(e.detail.layerid)) {
        e.detail.layerid.forEach(id=>{
          this.updateSingleLayerVisibility(id, e.detail.visible);
        });
      } else {
        this.updateSingleLayerVisibility(e.detail.layerid, e.detail.visible);
      }
      this.map._update(true); // TODO: how refresh map wihtout calling private mapbox-gl function?
    }
  }
  updateSingleLayerOpacity(id, opacity) {
    const layer = this.map.getLayer(id);
    if (layer) {
      switch (layer.type) {
        case 'raster':
          this.map.setPaintProperty(id, 'raster-opacity', opacity);
          break;
        case 'fill':
          this.map.setPaintProperty(id, 'fill-opacity', opacity);
          break;
        case 'line':
          this.map.setPaintProperty(id, 'line-opacity', opacity);
          break;
        case 'symbol':
          this.map.setPaintProperty(id, 'text-opacity', opacity);
          break;
      }
    }
  }
  updateLayerOpacity(e) {
    if (this.map) {
      if (Array.isArray(e.detail.layerid)) {
        e.detail.layerid.forEach(id=>{
          this.updateSingleLayerOpacity(id, e.detail.opacity);
        })
      } else {
        this.updateSingleLayerOpacity(e.detail.layerid, e.detail.opacity);
      }
    }
  }
  updateSingleLayerPaintProperty(id, propertyInfo) {
    const layer = this.map.getLayer(id);
    if (layer) {
      for (let key in propertyInfo) {
        if (key !== "layerid") {
          this.map.setPaintProperty(id, key, propertyInfo[key]);  
        }
      }
    }
  }
  updateLayerPaintProperty(e) {
    if (this.map) {
      if (Array.isArray(e.detail.layerid)) {
        e.detail.layerid.forEach(id=>{
          this.updateSingleLayerPaintProperty(id, e.detail);
        })
      } else {
        this.updateSingleLayerPaintProperty(e.detail.layerid, e.detail);
      }
    }
  }
  removeSourceIfOrphaned(source) {
    const otherSourceLayers = this.map.getStyle().layers.filter(layer=>layer.source===source);
    if (otherSourceLayers.length === 0) {
      if (this.map.getSource(source)) {
        this.map.removeSource(source);
      }
    }
  }
  removeLayer(e) {
    if (this.map) {
      const targetLayer = this.map.getLayer(e.detail.layerid);
      if (targetLayer) {
        const source = targetLayer.source;
        this.map.removeLayer(targetLayer.id);
        this.removeSourceIfOrphaned(source);
        
      } else {
        // layer not found, check if this layer is a style
        const styleLayers = this.map.getStyle().layers.filter(layer=>layer.metadata?layer.metadata.styleid === e.detail.layerid:false);
        styleLayers.forEach(layer=>{
          const source = layer.source;
          this.map.removeLayer(layer.id);
          this.removeSourceIfOrphaned(source);
        });
      }
      this.resetLayerList();
      this.map._update(true); // TODO: how refresh map without calling private "_update()"?
    }
  }
  restoreNoneReferenceLayers()
  {
    if (this.extraLayers) {
      this.extraLayers.forEach(layer=>{
        if (!this.map.getSource(layer.storedSource.id)) {
          this.map.addSource(layer.storedSource.id, layer.storedSource.source);
          if (layer.storedSource.source.tiles) {
            const newSource = this.map.getSource(layer.storedSource.id);
            if (!newSource.tiles) {
              // mapbox-gl bug? explicitly set .tiles property if necessary
              newSource.tiles = layer.storedSource.source.tiles;
            }
          }
        }
        layer.storedSource = null;
        delete layer.storedSource;
        this.addLayer({detail:layer});
      });
      this.extraLayers = null;
    }
  }
  storeNoneReferenceLayers()
  {
    this.extraLayers = this.map.getStyle().layers.filter(layer=>{
      if (!layer.metadata || !layer.metadata.reference) {
        if (!layer.source) {
          return false;
        }
        const layerSource = this.map.getSource(layer.source);
        let typedSource = {};
        switch (layerSource.type) {
          case "raster":
            if (layerSource.url) {
              typedSource = {
                type: "raster",
                tileSize: layerSource.tileSize,
                url: layerSource.url
              }
            } else {
              typedSource = {
                type: "raster",
                tileSize: layerSource.tileSize,
                attribution: layerSource.attribution,
                tiles: layerSource.tiles,
                minzoom: layerSource.minzoom,
                maxzoom: layerSource.maxzoom
              }
            }
            break;
          case "geojson":
            typedSource = {
              type: "geojson",
              attribution: layerSource.attribution,
              data: layerSource._data
            }
            break;
          case "vector":
            if (layerSource.url) {
              typedSource = {
                  type: "vector",
                  url: layerSource.url
              }
            } else {
              typedSource = {
                id: layer.source,
                type: "vector",
                attribution: layerSource.attribution,
                tiles: layerSource.tiles,
                url: layerSource.url,
                minzoom: layerSource.minzoom,
                maxzoom: layerSource.maxzoom
              }
            }
            break;
          case "raster-dem":
            if (layerSource.url) {
              typedSource = {
                type: "raster-dem",
                url: layerSource.url
              }
            } else {
              typedSource = {
                type: "raster-dem",
                tileSize: layerSource.tileSize,
                encoding: layerSource.encoding,
                tiles: layerSource.tiles,
                attribution: layerSource.attribution
              }
            }
            break;
        }
        if (!typedSource.attribution) {
          delete typedSource.attribution; // undefined attribution not allowed
        }
        if (!typedSource.url) {
          delete typedSource.url;
        }
        if (!typedSource.tiles) {
          delete typedSource.tiles;
        }
        layer.storedSource = {
          id: layer.source,
          source: typedSource
        }
        return true;
      }
      return false;
    });
  }
  setReferenceLayers(styleId, styleTitle) {
    this.map.getStyle().layers.forEach(layer=>{
      let mapLayer = layer;
      if (mapLayer.metadata) {
        mapLayer.metadata.reference = true;
      } else {
        // get reference to original layer
        mapLayer = this.map.getLayer(layer.id);
        mapLayer.metadata = {reference: true};
      }
      if (styleId && !mapLayer.metadata.styleid) {
        mapLayer.metadata.styleid = styleId;
      }
      if (styleTitle && !mapLayer.metadata.styletitle) {
        mapLayer.metadata.styletitle = styleTitle;
      }
    });
  }
  applyStyle(style, styleId, styleTitle) {
    for (let id in style.sources) {
      if (!this.map.getSource(id)) {
        this.map.addSource(id, style.sources[id]);
      }
    }
    style.layers.forEach(layer=>{
      if (!layer.metadata) {
        layer.metadata = {};
      }
      layer.metadata.styletitle=styleTitle;
      layer.metadata.styleid=styleId;
      this.addLayer({detail:layer});
    });
  }
  loadStyle(url, styleId, styleTitle) {
    if (typeof url === 'object') {
      // no need to dereference url
      return this.applyStyle(url, styleId, styleTitle);
    }
    if (url.split('/')[0].indexOf(':') === -1) {
      // relative url
      url = this.baseURI + url;
    } 
    if (url.indexOf('mapbox:') === 0) {
      url = url.replace('mapbox://styles/mapbox/', 'https://api.mapbox.com/styles/v1/mapbox/') + `?access_token=${EduGISkeys.mapbox}`;
    }
    fetch(url).then(data=>data.json()).then(style=>{
      this.applyStyle(style, styleId, styleTitle);
    });
  }
  removeReferenceLayers()  {
    const referenceLayers = this.map.getStyle().layers.filter(layer=>layer.metadata && layer.metadata.reference);
    referenceLayers.forEach(layer=>{
      this.map.removeLayer(layer.id)
      if (this.map.getSource(layer.id)) {
        this.map.removeSource(layer.id);
      }
    });
  }
  addStyle(layerInfo) {
    const styleId = layerInfo.id;
    const styleTitle = layerInfo.metadata.title ? layerInfo.metadata.title : styleId ? styleId : "style title not defined";
    if (layerInfo.metadata && layerInfo.metadata.reference) {
      if (this.styleLoading) {
        return;
      }
      this.styleLoading = true;
      /* replace reference style */
      /* remove old reference layers */
      this.removeReferenceLayers(); 
      /* store non reference layers */
      this.storeNoneReferenceLayers();
      /* update layerlist */
      this.layerlist = [...this.layerlist.filter(layer=>layer.reference==false || layer.background)];
      /* set callback for map.setStyle() */
      this.map.once('styledata', ()=>{
        /* add reference metadata to new layers set by setStyle() */
        this.setReferenceLayers(styleId, styleTitle);
        /* restore old non-reference layers */
        this.restoreNoneReferenceLayers();
        
        /* allow new styles to be set */
        setTimeout(()=>{
          this.resetLayerList();          
          this.styleLoading = false;
          this.map._update(true); // TODO: how refresh map wihtout calling private mapbox-gl function?
        }, 1000);
      });
      this.map.setStyle(layerInfo.source);
    } else {
      /* add style to existing layers */
      this.loadStyle(layerInfo.source, styleId, styleTitle);
    }
  }
  addLayer(e) {
    const layerInfo = e.detail;
    if (layerInfo.type === 'style') {
      this.addStyle(layerInfo);
    } else {
      layerInfo.metadata = Object.assign(layerInfo.metadata || {}, {userlayer: true});
      if (layerInfo.metadata && layerInfo.metadata.reference) {
        this.removeReferenceLayers();
        this.layerlist = [...this.layerlist.filter(layer=>layer.reference==false || layer.background)];        
        this.map.addLayer(layerInfo, this.map.getStyle().layers.length ? this.map.getStyle().layers[0].id : undefined);
      } else {
        if (layerInfo.type == "sheetlayer") {
          this.sheetdialog = layerInfo;
          this.requestUpdate();
        } else {
          if (!this.map.getLayer(layerInfo.id)) {
            if (layerInfo.type === "webgltraffic") {
              this.map.addLayer(new TrafficLayer(layerInfo.source.data));
            } else {
              this.map.addLayer(layerInfo);
            }
          }
        }
      }
      this.resetLayerList();
    }
  }
  moveLayer(e) {
    if (e.detail.beforeFirst) {
      e.detail.layers.reverse().forEach(layer=>this.map.moveLayer(layer));
    } else {
      e.detail.layers.reverse().forEach(layer=>this.map.moveLayer(layer, e.detail.beforeLayer));
    }
    this.resetLayerList();
  }
  updatePitch(degrees) {
    if (this.map) {
      if (!isNaN(parseFloat(degrees)) && isFinite(degrees)) {
        this.pitch = parseFloat(degrees);
      } else {
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
      }
      this.map.setPitch(this.pitch);
    }
  }
  fitBounds(e)
  {
    this.map.fitBounds(e.detail.bbox, {maxZoom: 19});
  }
  hideMenu(e) {
    this.shadowRoot.querySelector('#tool-menu-container').classList.toggle('collapsed');
    this.shadowRoot.querySelector('#panel-container').classList.toggle('collapsed');
    this.shadowRoot.querySelector('#button-hide-menu').classList.toggle('collapsed');
  }
  hideLegend(e) {
    const container = this.shadowRoot.querySelector('#legend-container-container');    
    const button = this.shadowRoot.querySelector('#button-hide-legend');
    button.classList.toggle('collapsed');
    if (button.classList.contains('collapsed')) {
      const rect = container.getBoundingClientRect();
      const width = rect.right - rect.left;
      container.style.right = 25-width + 'px';
      setTimeout(()=>{
        container.style.width = width + 'px';
        container.style.maxWidth = width + 'px';
      }, 500);
    } else {
      container.style.right = null;
      container.style.width = null;
      container.style.maxWidth = null;
    }
  }
  toggleTool(name) {
    this.infoClicked = false;
    if (this.currentTool === name) {
      this.currentTool = '';
    } else {
      this.currentTool = name;
    }
  }
  render() {
    
    return html`<style>
      @import "${this.baseURI}node_modules/mapbox-gl/dist/mapbox-gl.css";
      /* workaround bug mapbox-gl v.051, https://github.com/mapbox/mapbox-gl-js/issues/7589 */
      .mapboxgl-ctrl.mapboxgl-ctrl-attrib p {
        display: inline-block;
        margin: 2px;
      }
      /* @import "${this.baseURI}node_modules/@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";*/
      :host {
        display: inline-block;
        min-width: 200px;
        min-height: 200px; 
        overflow: hidden;
      }
      .webmap {width: 100%; height: 100%}
      .mapboxgl-ctrl.mapboxgl-ctrl-group.mapboxgl-ctrl-zoom {
        background: rgba(255, 255, 255, 0.75);
      }
      #tool-menu-container {
        position: absolute;
        display: flex;
        align-items: flex-start;
        max-width: 375px; /* #panel-container + #tools-menu */
        left: 10px;
        top: 10px;
        transition: left 0.5s ease, max-width 0.5s ease;
        pointer-events: none;
      }      
      #tool-menu-container.collapsed {
        left: -55px;
        max-width: 55px;
      }
      #tools-menu {
        box-shadow: rgba(204, 204, 204, 0.5) 1px 0px 1px 1px;
        width: 55px;
        pointer-events: auto;
      }
      #panel-container {
        width: 0px;
        transition: width 0.5s ease;
        overflow: hidden;
        pointer-events: auto;
      }
      #panel-container.active {
        width: 320px;
      }
      #panel-container.collapsed {
        width: 0px;
      }
      #tools-menu ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      #tools-menu ul li {
        width: 55px;
        height: 55px;
        border-bottom: 1px solid rgba(204,204,204,.52);
      }
      #button-hide-menu {
        position: absolute;
        top: 0;
        right: -25px;
        width: 25px;
        height: 55px;
        cursor: pointer;
        border-left: 1px solid #c1c1c1;
        color: #666;
        fill: #666;
        background-color: rgba(250,250,250,.87);
        box-shadow: 1px 0 1px 1px rgba(204,204,204,.5);
        line-height: 65px;
        text-align: center;
        white-space: nowrap;
        transform: rotate(0deg);
        transition: transform 0.5s ease-in-out;
        pointer-events: auto;
      }
      #button-hide-menu.collapsed {
        transform: rotate(-180deg);
      }
      #button-hide-legend {
        width: 25px;
        height: 55px;
        cursor: pointer;
        border-left: 1px solid #c1c1c1;
        color: #666;
        fill: #666;
        background-color: rgba(250,250,250,.87);
        box-shadow: 1px 0 1px 1px rgba(204,204,204,.5);
        line-height: 65px;
        text-align: center;
        white-space: nowrap;
        transform: rotate(-180deg);
        transition: transform 0.5s ease-in-out;
        pointer-events: auto;
      }
      #button-hide-legend.collapsed {
        transform: rotate(0deg);
      }
      .offset {
        display: inline-block;
        width: 5px;
      }
      #legend-container-container {
        position: absolute;
        display: flex;
        flex-direction: row;
        top: 10px;
        right: 10px;
        justify-content: flex-end;
        transition: right 0.5s ease;
        pointer-events: none;
        box-sizing: border-box;
      }
      </style>
    <div class="webmap"></div>
    <div id="tool-menu-container">
      <div id="button-hide-menu" @click="${e=>this.hideMenu(e)}">
        <span class="offset"></span><i>${arrowLeftIcon}</i>
      </div>
      <div id="tools-menu">
        <ul>
          <li>
            <map-iconbutton .icon="${gmSearchIcon}" info="Adres zoeken" @click="${e=>this.toggleTool('search')}" .active="${this.currentTool==='search'}"></map-iconbutton>
          </li><li>
            <map-iconbutton .icon="${layermanagerIcon}" info="Data-catalogus" @click="${e=>this.toggleTool('datacatalog')}" .active="${this.currentTool==='datacatalog'}"></map-iconbutton>
          </li><li>
            <map-iconbutton .icon="${measureIcon}" info="Afstanden meten" @click="${e=>this.toggleTool('measure')}" .active="${this.currentTool==='measure'}"></map-iconbutton>
          </li><li>
            <map-iconbutton .icon="${gmInfoIcon}" info="Locatie-informatie" @click="${e=>this.toggleTool('info')}" .active="${this.currentTool==='info'}"></map-iconbutton>
          </li><li>
            <map-iconbutton .icon="${languageIcon}" info="Kaarttaal" @click="${e=>this.toggleTool('language')}" .active="${this.currentTool==='language'}"></map-iconbutton>
          </li><li>
            <map-iconbutton .icon="${html`<b>3D</b>`}" info="Kaarthoek" @click="${e=>this.toggleTool('pitch')}" .active="${this.currentTool==='pitch'}"></map-iconbutton>
          </li><li>
            <map-iconbutton .icon="${gpsFixedIcon}" info="Waar ben ik?" @click="${e=>this.toggleTool('geolocate')}" .active="${this.currentTool==='geolocate'}"></map-iconbutton>
          </li><li>
            <map-iconbutton .icon="${drawIcon}" info="Tekenen" @click="${e=>this.toggleTool('draw')}" .active="${this.currentTool==='draw'}"></map-iconbutton>
          </li>
        </ul>
      </div>
      <div id="panel-container" class="${this.currentTool !==''?"active":""}">
        <map-panel .active="${this.currentTool==="search"}">
          <map-search .active="${this.currentTool==="search"}" .viewbox="${this.viewbox}" @searchclick="${e=>this.fitBounds(e)}" @searchresult="${e=>this.searchResult(e)}"></map-search>
        </map-panel>
        <map-panel .active="${this.currentTool==="datacatalog"}">
          <map-data-catalog .active="${this.currentTool==="datacatalog"}" .datacatalog="${this.datacatalog}" @addlayer="${(e) => this.addLayer(e)}" @removelayer="${e=>this.removeLayer(e)}"></map-data-catalog>
        </map-panel>
        <map-panel .active="${this.currentTool==='measure'}">
          <map-measure .webmap="${this.map}" .active="${this.currentTool==='measure'}"></map-measure>
        </map-panel>
        <map-panel .active="${this.currentTool==='info'}">
          <map-info-formatted .info="${this.featureInfo}" .active="${this.currentTool==='info'}" @togglestreetview="${e=>this.toggleStreetView(e)}"></map-info-formatted>
        </map-panel>
        <map-panel .active="${this.currentTool==='language'}">
          <map-language .active="${this.currentTool==='language'}" language="autodetect" @togglelanguagesetter="${e=>this.toggleLanguageSetter(e)}"></map-language>
        </map-panel>
        <map-panel .active="${this.currentTool==='geolocate'}">
        <map-geolocation .webmap="${this.map}" .active="${this.currentTool==='geolocate'}"></map-geolocation>
        </map-panel>        
        <map-panel .active="${this.currentTool==='pitch'}">
          <map-pitch .active="${this.currentTool==='pitch'}" .pitch="${this.currentTool==='pitch' && this.map && this.map.getPitch()}" @updatepitch="${e=>this.updatePitch(e.detail.degrees)}"><map-pitch>
        </map-panel>
        <map-panel .active="${this.currentTool==='draw'}">
          <div style="width:100%">tekenen tijdelijk niet beschikbaar</div>
        </map-panel>
      </div>
    </div>
      
    <map-coordinates .visible="${this.coordinates.toLowerCase() !== 'false'}" .lon="${this.displaylng}" .lat="${this.displaylat}" .resolution="${this.resolution}" .clickpoint="${this.lastClickPoint?this.lastClickPoint:undefined}"></map-coordinates>
    <div id="legend-container-container">
      <div id="button-hide-legend" @click="${e=>this.hideLegend(e)}">
        <span class="offset"></span><i>${arrowLeftIcon}</i>
      </div>
      <map-selected-layers 
        .layerlist="${this.layerlist}"
        .zoom="${this.zoom}"
        .datagetter="${this.datagetter}"
        @changepaintproperty="${e=>this.updateLayerPaintProperty(e)}"
        @updatevisibility="${(e) => this.updateLayerVisibility(e)}"
        @updateopacity="${(e)=>this.updateLayerOpacity(e)}"
        @removelayer="${(e) => this.removeLayer(e)}">

      </map-selected-layers>
      <mmap-legend-container .layerlist="${this.layerlist}" 
        .visible="${this.haslegend}" 
        .active="${true}" 
        .zoom="${this.zoom}" 
        @movelayer="${e=>this.moveLayer(e)}" 
        @updatevisibility="${(e) => this.updateLayerVisibility(e)}" 
        @updateopacity="${(e)=>this.updateLayerOpacity(e)}" 
        @removelayer="${(e) => this.removeLayer(e)}">
      </mmap-legend-container>
    </div>
    ${this.sheetdialog?html`<map-dialog dialogtitle="Sheet-Kaart" @close="${e=>{this.sheetdialog=null;this.requestUpdate();}}"><map-gsheet-form .layerinfo="${this.sheetdialog}" @addlayer="${(e) => this.addLayer(e)}"></map-gsheet-form></map-dialog>`:html``} 
    <map-spinner .webmap="${this.map}"></map-spinner>`
  }
  getData()
  {
    if (!this.map) {
      return {};
    }
    return {querySourceFeatures: this.map.querySourceFeatures.bind(this.map)};
  }
  _positionString(prop) {
    // convert prop to control position
    let propl = prop.toLowerCase().trim();
    if (propl === "true" || propl === "") {
      return undefined;
    }
    return propl;
  }
  firstUpdated() {
    if (this.accesstoken) {
      mapboxgl.accessToken = this.accesstoken;
    }
    this.map = new mapboxgl.Map({
        container: this.shadowRoot.querySelector('div'), 
        style: this.mapstyle,
        center: [this.lon,this.lat],
        zoom: this.zoom
    });
    this.datagetter = {
      querySourceFeatures: this.map.querySourceFeatures.bind(this.map)
    };
    
    if (this.navigation.toLowerCase() !== "false") {
      this.map.addControl(new ZoomControl(), this._positionString(this.navigation));
      this.map.addControl(new mapboxgl.NavigationControl(), this._positionString(this.navigation));      
    }
    if (this.scalebar.toLowerCase() !== "false") {

      this.map.addControl(new mapboxgl.ScaleControl(), this._positionString(this.scalebar));
    }
    
    if (this.coordinates.toLowerCase() !== "false") {
      this.map.on('mousemove', e=>{this.displaylat = e.lngLat.lat; this.displaylng = e.lngLat.lng;});
    }
    this.featureInfo = [];
    this.map.on('mousemove', e=>this.handleInfo(e));
    
    this.map.autodetectLanguage(); // set openmaptiles language to browser language
    this._mapMoveEnd();
    this.map.on('moveend', ()=>{this._mapMoveEnd()});
    this.map.on('click', (e)=>this.mapClick(e));
    this.map.on('render', e=>this.mapHasRendered());
    this.map.on('zoomend', e=>this.mapHasZoomed());
    
    /*
    const modes = MapboxDraw.modes;
    modes.static = StaticMode;

    this.draw = new MapboxDraw({ modes: modes, boxSelect: false });
    this.map.addControl(this.draw, 'bottom-left');
    */

    this.map.on('load', ()=>{
        this.setReferenceLayers(this.mapstyleid, this.mapstyletitle);
        this.resetLayerList();
        //this.draw.changeMode('static');
    });
    this.addEventListener("languagechanged", e=>this.setLanguage(e));
  }

  updateLayerCalculatedPaintProperties(layerlist) {
    layerlist.forEach(layer=>{
      const mapLayer = this.map.getLayer(layer.id);
      if (mapLayer.paint) {
        layer._paint = mapLayer.paint;
      }
    });
  }

  mapHasZoomed() {
    this.updateLayerCalculatedPaintProperties(this.layerlist);
  }

  mapHasRendered() {
    if (this.resetLayerListRequested) {
      if (!this.map.style.stylesheet) {
        /* mapbox-gl bug? getStyle() throws exception on empty style */
        this.layerlist = [];
        console.log("layerlist empty")
        return;
      }
      const layerlist = this.map.getStyle().layers;
      this.updateLayerCalculatedPaintProperties(layerlist);
      this.layerlist = [...layerlist];
      this.resetLayerListRequested = false;
    }
  }

  resetLayerList() {
    this.resetLayerListRequested = true;
  }
  
  _mapMoveEnd() {
    const bounds = this.map.getBounds();
    this.viewbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
    this.resolution = getResolution(this.map);
    const center = this.map.getCenter();
    this.displaylat = center.lat;
    this.displaylng = center.lng;
    this.zoom = this.map.getZoom();
    this.dispatchEvent(new CustomEvent('moveend', 
      {detail: {
        center: center,
        viewbox: this.viewbox, 
        zoom: this.map.getZoom(),
        bearing: this.map.getBearing(),
        pitch: this.map.getPitch()}
      }
    ));
    this.requestUpdate();
  }
  setLanguage(e) {
    this.storeNoneReferenceLayers();
    if (e.detail.language === "autodetect") {
      this.map.autodetectLanguage();
    } else {
      this.map.setLanguage(e.detail.language, (e.detail.language !== "native"));
    }
    setTimeout(()=>this.restoreNoneReferenceLayers(), 1000); // how else?    
  }
  mapClick(e) {
    this.lastClickPoint = [e.lngLat.lng,e.lngLat.lat];
    this.handleInfo(e);
  }
  getIcon(iconUrl) {
    const name = iconUrl.split('/').pop().split('.').shift();
    if (this.map.hasImage(name)) {
      return name;
    }
    const baseUrl = 'https://nominatim.openstreetmap.org/';
    if (iconUrl.startsWith(baseUrl)) {
      // route through edugis to workaround openstreetmap CORS error
      iconUrl = 'https://tiles.edugis.nl/nominatim/' + iconUrl.slice(baseUrl.length);
    }
    if (!this.loadedNames) {
      this.loadedNames = [];
    }
    if (this.loadedNames.indexOf(name) == -1) {
      this.loadedNames.push(name);
      this.map.loadImage(iconUrl, (error, image) => {
        if (error) {
          // todo
        } else {
          this.map.addImage(name, image);
        }
      })
    }
    return name;
  }
  searchResult(e) {
    // add list of found elements to temporary map layer
    if (this.map) {
      const mapSearchSource = this.map.getSource('map-search-geojson');
      if (!mapSearchSource) {
        this.map.addSource('map-search-geojson', searchSource);
        this.map.addLayer(searchSurface);
        this.map.addLayer(searchLines);
        this.map.addLayer(searchPoints);
      }
      if (e.detail != null) {        
        searchGeoJson.features = e.detail.map(item=>{
          return {
              "type":"Feature",
              "geometry": item.geojson,
              "properties": {
                "icon": (item.icon?this.getIcon(item.icon): 'star_11'),
                "name": item.display_name.split(",").shift()
              }
          };
        });
        this.map.getSource('map-search-geojson').setData(searchGeoJson);
      } else {
        searchGeoJson.features = [];
        this.map.removeLayer(searchPoints.id);
        this.map.removeLayer(searchLines.id);
        this.map.removeLayer(searchSurface.id);
        this.map.removeSource('map-search-geojson');
      }
      
    }
  }
  XMLtoGeoJSON(xmlString)
  {
      const result = {"type": "FeatureCollection", "features": []};
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString,"text/xml");
      const root = xmlDoc.getElementsByTagName("GetFeatureInfoResponse");
   
      if (root && root.length) {
          const layers = root[0].getElementsByTagName("Layer");
          const layerInfo = {};
          for (var i = 0; i < layers.length; i++) {
              layerInfo.name = layers[i].getAttribute('name');
              const features = layers[i].getElementsByTagName('Feature');
              if (features && features.length) {
                  for (let j = 0; j < features.length; j++) {
                      const featureInfo = {};                  
                      featureInfo.properties = {};
                      const attributes = features[j].getElementsByTagName('Attribute');
                      if (attributes && attributes.length) {
                          for (let k = 0; k < attributes.length; k++) {
                              const attrName = attributes[k].getAttribute('name');
                              if (attrName != 'geometry') {
                                  featureInfo.properties[attrName] = attributes[k].getAttribute('value');
                              } else {
                                  let geometryString = attributes[k].getAttribute('value');
                                  const endPos = geometryString.indexOf('(');
                                  const type = geometryString.substring(0, endPos).trim();
                                  geometryString = geometryString.substring(endPos).split(',').map(function(pair){return "["+pair.trim().replace(" ", ",")+"]"}).join(",").replace(/\(/g,"[").replace(/\)/g,"]");
                                  featureInfo.geometry = {"type": type, "coordinates": JSON.parse(geometryString)};
                              }
                          }
                      }
                      
                      const featureObject = {"type": "Feature", "properties": featureInfo.properties, "geometry": featureInfo.geometry, "layername": layerInfo.name};
                      
                      const bBoxInfo = {};
                      const boundingBox = features[j].getElementsByTagName('BoundingBox');
                      if (boundingBox && boundingBox.length) {
                          bBoxInfo.left = boundingBox[0].getAttribute('minx');
                          bBoxInfo.right = boundingBox[0].getAttribute('maxx');
                          bBoxInfo.top = boundingBox[0].getAttribute('maxy');
                          bBoxInfo.bottom = boundingBox[0].getAttribute('miny');
                          bBoxInfo.srs = boundingBox[0].getAttribute('SRS');
                          featureObject.bbox = [parseFloat(bBoxInfo.left), parseFloat(bBoxInfo.bottom), parseFloat(bBoxInfo.right), parseFloat(bBoxInfo.top)];
                      }
                      
                      if (result.srs) {
                          if (bBoxInfo.srs != result.srs) {
                              // set deviating feature srs
                              featureObject.srs =  bBoxInfo.srs;
                          }
                      } else {
                          if (bBoxInfo.srs) {
                              // set global GeoJSON srs
                              result.srs =  bBoxInfo.srs;
                          }
                      }
                      result.features.push(featureObject);
                  }
              }
          }        
      } else {
        const gmlInfo = xmlDoc.getElementsByTagNameNS("http://www.opengis.net/gml", "featureMember");
        if (gmlInfo.length) {
          const xmlDoc2 = parser.parseFromString(gmlInfo[0].innerHTML,"text/xml");
          const attrs = [].slice.call(xmlDoc2.children[0].children).map(attr=>[attr.tagName.split(':')[1], attr.textContent]);
          const featureInfo = {};
  
          featureInfo.properties = attrs.reduce((result, attr)=>
              {
              if (attr[0] != 'geometry') {
                result[attr[0]]=attr[1];
              }
              return result;
            },
          {});
          featureInfo.geometry = null; /* todo: GML geometry parser */
          result.features.push(featureInfo);
        } else {
          const mapserverGmlInfo = xmlDoc.getElementsByTagNameNS("http://www.opengis.net/gml", "boundedBy");
          if (mapserverGmlInfo.length && mapserverGmlInfo[0].parentElement && mapserverGmlInfo[0].parentElement.parentElement) {
            const xmlDoc2 = parser.parseFromString(mapserverGmlInfo[0].parentElement.parentElement.innerHTML, "text/xml");
            const attrs = [].slice.call(xmlDoc2.children[0].children).map(attr=>[attr.tagName, attr.textContent]);
            const featureInfo = {};
            featureInfo.properties = attrs.reduce((result, attr)=>
                {
                if (attr[0] != 'gml:boundedBy') {
                  result[attr[0]]=attr[1];
                }
                return result;
              },
            {});
            featureInfo.geometry = null;
            result.features.push(featureInfo);
          } else {
            // unknown xml format or not xml?
          }
        }          
      }
      return result;
  }
  jsonToGeoJSON(json) {
    return {
      "type": "FeatureCollection", 
      "features": json.map(item=>{
        return {
          "type":"Feature",
          "geometry": {"type": "Point", "coords": item.point.coords},
          "properties": item
        }
      })
    }
  }
  queryWMSFeatures(lngLat, metadata) {
    const featureInfoUrl = metadata.getFeatureInfoUrl;
    const featureInfoFormat = metadata.getFeatureInfoFormat ? metadata.getFeatureInfoFormat : 'text/xml';
    const wmtsResolution = (2 * 20037508.342789244) / (256 * Math.pow(2, (Math.round(this.zoom+1))));
    // get webmercator coordinates for clicked point
    const clickedPointMercator = projectLngLat(lngLat);
    // create 3 x 3 pixel bounding box in webmercator coordinates
    const leftbottom = {x: clickedPointMercator.x - 1.5 * wmtsResolution, y: clickedPointMercator.y - 1.5 * wmtsResolution};
    const righttop = {x: clickedPointMercator.x + 1.5 * wmtsResolution, y: clickedPointMercator.y + 1.5 * wmtsResolution};
    // getFeatureinfo url for center pixel of 3x3 pixel area
    const params = `&width=3&height=3&x=1&y=1&crs=EPSG:3857&srs=EPSG:3857&info_format=${featureInfoFormat}&bbox=`;
    const url=featureInfoUrl+params+(leftbottom.x)+","+(leftbottom.y)+","+(righttop.x)+","+(righttop.y);
    return fetch(url)
      .then(response=>{
        if (featureInfoFormat === 'application/json') {
          return response.json().then(json=>this.jsonToGeoJSON(json));
        }
        return response.text().then(text=>this.XMLtoGeoJSON(text))}
      );
  }
  waitingForResponse(id) {
    return {
      "type":"Feature",
      "layer": {"id": id},
      "geometry": null,
      "properties": {"info": "waiting for response..."}
    };
  }
  toggleStreetView(e) {
    this.streetViewOn = e.detail.streetview;
  }
  getStreetViewImage(lngLat)
  {
    const url = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lngLat.lat},${lngLat.lng}&key=${EduGISkeys.google}`;
    return fetch(url).then(response=>response.json()).then(json=>{
      console.log(json);
      const imageUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x300&pano=${json.pano_id}&key=${EduGISkeys.google}`;
      return imageUrl;
    })
  }
  handleInfo(e) {
    if (this.currentTool !== 'info') {
      this.infoClicked = false;
      if (this.featureInfo.length) {
        this.featureInfo = [];
      }
      return;
    }
    if (e.type === "mousemove" && !this.infoClicked) {
      this.featureInfo = this.map.queryRenderedFeatures(e.point);
      return;
    }
    if (e.type === "click") {
      this.infoClicked = true;
      const layers = this.map.getStyle().layers;
      const featureInfo = [];
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].metadata && layers[i].metadata.getFeatureInfoUrl) {
          if ((layers[i].minzoom === undefined || this.zoom >= layers[i].minzoom) &&
           (layers[i].maxzoom === undefined || this.zoom <= layers[i].maxzoom )) {
             let wmsFeatures = this.waitingForResponse(layers[i].id);
             featureInfo.push(wmsFeatures);
             this.queryWMSFeatures(e.lngLat, layers[i].metadata)
              .then(feature=>{
                if (feature.features.length) {
                  if (feature.features.length == 1) {
                    wmsFeatures.properties = feature.features[0].properties;
                  } else {
                    // multiple features found
                    wmsFeatures.properties = {};
                    feature.features.forEach(feature=>{
                      wmsFeatures.properties = Object.assign(wmsFeatures.properties, feature.properties);
                    });
                  }
                } else {
                  wmsFeatures.properties = {};
                }
                this.featureInfo = [...this.featureInfo];
                this.requestUpdate();
              });
           }
        } else {
          const features = this.map.queryRenderedFeatures(e.point, {layers:[layers[i].id]});
          if (features.length) {
            featureInfo.push(...features.reverse());
          }
        }
      }
      if (this.streetViewOn) {
        const streetViewInfo = {"type":"feature", "properties": {"image": "retrieving..."}, "layer": {"id":"streetview"}};
        featureInfo.push(streetViewInfo);
        this.getStreetViewImage(e.lngLat).then(imageurl=>{
          streetViewInfo.properties.image = imageurl;
          this.featureInfo = [...this.featureInfo];
          this.requestUpdate();
        });
      }
      this.featureInfo = featureInfo.reverse();
    }
    
  }
}
customElements.define('web-map', WebMap);
