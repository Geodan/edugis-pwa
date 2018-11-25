import {LitElement, html} from '@polymer/lit-element';
import './map-selected-layer';
/**
* @polymer
* @extends HTMLElement
*/
class MapSelectedLayerSet extends LitElement {
  static get properties() { 
    return { 
      active: {type: Boolean},
      layerlist: {type: Array},
      zoom: {type: Number},
    }; 
  }
  constructor() {
      super();
      this.active = true;
      this.zoom = 0;
  }
  shouldUpdate(changedProps) {
      return this.active;
  }
  render() {
    if (this.layerlist.length === 0) {
      return html`
        <style>
          .layercontainer {
            display: block;
            background: white;
            border-radius: 4px;
            padding: 10px;
            margin-top: 10px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px;
            cursor: default;
            -moz-user-select: none;
            -webkit-user-select: none;
            user-select: none;
          }
        </style>
        <div class="layercontainer">Geen lagen geselecteerd</div>`;
    }
    return html`
    ${this.layerlist.map(layer=>html`<map-selected-layer .layer="${layer}" .zoom="${this.zoom}"></map-selected-layer>`)}
    `;
  }
}
customElements.define('map-selected-layer-set', MapSelectedLayerSet);
