
import './map-iconbutton';
import {imageSearchIcon, searchIcon} from './my-icons';

import {LitElement, html} from '@polymer/lit-element';
class MapSearch extends LitElement {
  static get properties() { 
    return { 
      info: String,
      resultList: Array
    }; 
  }
  constructor() {
    super();
    // properties
    this.info = "zoek plaats of adres";
    this.resultList = [];
  }
  search(e) {
    const searchText = this.shadowRoot.querySelector('input').value.trim();
    if (searchText.length > 1) {
      //const url = `https://nominatim.openstreetmap.org/search/${encodeURIComponent(searchText)}?format=json&viewbox=${this.props.viewbox.join(',')}&bounded=0`;
      const url = `https://nominatim.openstreetmap.org/search/${encodeURIComponent(searchText)}?format=json`;
      fetch(url)
      .then(response => response.json())
      .then(data => this.resultList = [...data]);
    } else {
      this.resultList = [];
    }
  }
  keypressed(e) {
    if (e.keyCode == 13) {
      this.search(e);
    } else {
      this.resultList = [];
    }
  }
  _render({info, resultList}) {
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
          width: 20em;
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
          left: 40px;
          top: 28px;
          font-size: 12px;
          width: 20em;
          max-height: 400px;
          overflow: auto;
          background-color: white;
        }
        .hidden {
          display: none;
        }
    </style>
    <map-iconbutton info="${info}" icon="${imageSearchIcon}"></map-iconbutton>
    <div class="searchbox"><input type="text" placeholder="${info}" on-keypress="${(e)=>this.keypressed(e)}">
    <span title="zoek" class="searchbutton" on-click="${(e)=>this.search(e)}">${searchIcon}</span></div>
      ${resultList.length?html`<div class="resultlist"><ul>${resultList.map(item=>html`<li>${item.display_name}</li>`)}</ul></div>`:''}`;
  }
  
}
customElements.define('map-search', MapSearch);
