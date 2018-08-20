
import './map-iconbutton';
import {imageSearchIcon, searchIcon, panoramaWideIcon as areaIcon, showChartIcon as lineIcon, locationOnIcon as pointIcon } from './my-icons';


function getIcon(osmtype) {
  switch(osmtype) {
    case 'relation':
      return areaIcon;
    case 'node':
      return pointIcon;
    case "way":
      return lineIcon;
    default:
      return osmtype;
  }
}

import {LitElement, html} from '@polymer/lit-element';
class MapSearch extends LitElement {
  static get properties() { 
    return { 
      info: String,
      resultList: Array,
      viewbox: Array,
      active: Boolean
    }; 
  }
  constructor() {
    super();
    // properties
    this.info = "zoek plaats of adres (via nominatim)";
    this.resultList = [];
    this.viewbox = undefined;
    this.active = true;
  }
  search(e) {
    const searchText = this.shadowRoot.querySelector('input').value.trim();
    if (searchText.length > 1) {
      let url;
      if (this.viewbox) {
        url = `https://nominatim.openstreetmap.org/search/${encodeURIComponent(searchText)}?format=json&viewbox=${this.viewbox.join(',')}&bounded=0`;
      } else {
        url = `https://nominatim.openstreetmap.org/search/${encodeURIComponent(searchText)}?format=json`;
      }
      fetch(url)
      .then(response => response.json())
      .then(data => this.resultList = [...data]);
    } 
  }
  keyup(e) {
    if (e.keyCode == 13) {
      this.search(e);
    } else {
      this.resultList = [];
    }
  }
  changed(e) {
    this.resultList = [];
  }
  zoomTo(point, bbox) {
    this.dispatchEvent(
      new CustomEvent('searchclick',
        {
            detail: {point: point, bbox: [bbox[2],bbox[0],bbox[3],bbox[1]]},
            bubbles: true,
            composed: true
        })
  );
  }
  _render({info, resultList, active}) {
    return html`<style>
        :host {
          position: absolute;
          left: 10px;
          top: 10px;
        }
        .searchbox {
          position: absolute;
          left: 40px;
          top: 0px;
          width: 320px;
          height: 30px;
          box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
          border-radius: 4px;
          background-color: white;
          display: flex;
          align-items: center;
        }
        .searchbox input {
          position: absolute;
          border: none;
          left: 1em;
          width: calc(100% - 50px);
        }
        .searchbox input:focus {
          outline: none;
          border-bottom: 1px solid lightblue;
        }
        .searchbutton {
          position: absolute;
          right: 5px;
          fill: gray;
          padding-top: 6px;
        }
        .searchbutton:hover {
          fill: darkcyan;
        }
        .resultlist {
          position: absolute;
          width: 320px;
          left: 40px;
          top: 28px;
          border-top: none;
          font-size: 12px;
          max-height: 400px;
          overflow: auto;
          background-color: white;
          border-radius: 4px;
          box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
        }
        .resultlist ul {
          list-style-type: none;
          margin: 0;
          padding:20px;
        }
        .resultlist ul li {
          border-bottom: 1px solid lightgray;
          cursor:pointer;
        }
        .resultlist ul li:hover {
          background-color: lightgray;
        }
        .resultlist ul li svg {
          fill: darkgray;
          width: 18px;
          height: 18px;
          margin-bottom: -0.4em;
        }
        .hidden {
          display: none;
        }
    </style>
    <map-iconbutton info="${info}" icon="${imageSearchIcon}" on-click="${e=>{this.active=!this.active;}}"></map-iconbutton>
    <div class$="searchbox${active?'':' hidden'}"><input type="text" placeholder="${info}" on-keyup="${(e)=>this.keyup(e)}">
    <span title="zoek" class="searchbutton" on-click="${(e)=>this.search(e)}">${searchIcon}</span></div>
      ${(active && resultList.length)?html`<div class="resultlist"><ul>${resultList.map(item=>html`<li on-click="${e=>this.zoomTo([item.lon,item.lat],item.boundingbox)}">${getIcon(item.osm_type)}${item.display_name}</li>`)}</ul></div>`:''}`;
  }
  
}
customElements.define('map-search', MapSearch);
