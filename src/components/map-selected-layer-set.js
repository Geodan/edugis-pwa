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
      layerlist: {type: Array}
    }; 
  }
  constructor() {
      super();
      this.active = true;
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
          }
        </style>
        <div class="layercontainer">Geen lagen geselecteerd</div>`;
    }
    return html`
    ${this.layerlist.reverse().map(layer=>html`<map-selected-layer .layer="${layer}"></map-selected-layer>`)}
    `;
  }
}
customElements.define('map-selected-layer-set', MapSelectedLayerSet);
