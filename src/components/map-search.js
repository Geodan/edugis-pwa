import "./map-iconbutton.js";
import { imageSearchIcon, searchIcon, panoramaWideIcon as areaIcon, showChartIcon as lineIcon, locationOnIcon as pointIcon, closeIcon } from "./my-icons.js";
import { searchIcon as gmSearchIcon } from "../gm/gm-iconset-svg.js";

function getIcon(osmtype) {
  switch (osmtype) {
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

import { LitElement, html} from "../../node_modules/lit/index.js";
/**
* @polymer
* @extends HTMLElement
*/

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
    super(); // properties

    this.info = "Landen, Plaatsen, Gebergten, Rivieren";
    this.resultList = null;
    this.viewbox = [];
    this.active = true;
  }

  triggerResult() {
    if (this.prevResultList == null && this.resultList == null) {
      return;
    }

    this.prevResultList = this.resultList;
    this.dispatchEvent(new CustomEvent('searchresult', {
      detail: this.resultList,
      bubbles: true,
      composed: true
    }));
  }

  search(e) {
    const searchText = this.shadowRoot.querySelector('input').value.trim();

    if (searchText.length > 1) {
      let url;

      if (this.viewbox.length) {
        url = `https://nominatim.openstreetmap.org/search/${encodeURIComponent(searchText)}?format=json&viewbox=${this.viewbox.join(',')}&bounded=0&polygon_geojson=1&addressdetails=1&limit=15`;
      } else {
        url = `https://nominatim.openstreetmap.org/search/${encodeURIComponent(searchText)}?format=json&polygon_geojson=1&addressdetails=1&limit=15`;
      }

      fetch(url).then(response => response.json()).then(data => {
        this.resultList = data;
        this.triggerResult();
      });
    }
  }

  keyup(e) {
    if (e.keyCode == 13) {
      this.search(e);
    } else {
      this.resultList = null;
      this.triggerResult();
    }
  }

  changed(e) {
    this.resultList = null;
    this.triggerResult();
  }

  zoomTo(point, bbox) {
    this.dispatchEvent(new CustomEvent('searchclick', {
      detail: {
        point: point,
        bbox: [bbox[2], bbox[0], bbox[3], bbox[1]]
      },
      bubbles: true,
      composed: true
    }));
  }

  searchErase(e) {
    if (this.resultList !== null) {
      this.shadowRoot.querySelector('input').value = "";
      this.resultList = null;
      this.triggerResult();
    }
  }

  render() {
    if (!this.active) {
      this.searchErase();
      return html``;
    }

    return html`<style>        
        .searchbox {
          width: 100%;
          height: 30px;
          display: flex;
          align-items: center;
          box-sizing: border-box;
        }
        .searchbox input {
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
        .searchbutton:hover, .erasebutton:hover {
          fill: darkcyan;
        }
        .erasebutton {
          position: absolute;
          right: 30px;
          fill: gray;
          padding-top: 6px;
        }
        .resultlist {
          right: 0px;
          padding-left: 40px;
          top: 28px;
          border-top: none;
          font-size: 12px;
          max-height: 400px;
          overflow: auto;
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
    <div class="searchbox${this.active ? '' : ' hidden'}">
      <input type="text" placeholder="${this.info}" @keyup="${e => this.keyup(e)}">
      ${this.active && this.resultList && this.resultList.length ? html`<i class="erasebutton" @click="${e => this.searchErase(e)}">${closeIcon}</i>` : ''}
      <span title="zoek" class="searchbutton" @click="${e => this.search(e)}">${searchIcon}</span>
    </div>
    ${this.active && this.resultList && this.resultList.length ? html`
      <div class="resultlist">
        <ul>
          ${this.resultList.map(item => html`
            <li @click="${e => this.zoomTo([item.lon, item.lat], item.boundingbox)}">
                ${item.hasOwnProperty('icon') ? html`
                  <img src="${item.icon}">` : html`${getIcon(item.osm_type)}`}
                ${item.display_name}
            </li>`)}
        </ul>
      </div>` : this.active && Array.isArray(this.resultList) && this.resultList.length === 0 ? html`
          <div class="resultlist">
            <ul>
              <li>niets gevonden</li>
            </ul>
          </div>` : ''}`;
  }

}

customElements.define('map-search', MapSearch);