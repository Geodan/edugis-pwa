
import {layersIcon} from './my-icons';
import './map-legend-item.js';


import {LitElement, html} from '@polymer/lit-element';
class MapLegendContainer extends LitElement {
  static get properties() { 
    return { 
      layerlist: Array,
      legendtitle: String,
      visible: Boolean,
      opened: Boolean
    }; 
  }
  constructor() {
      super();
      this.maplayers = [];
      this.visible = false;
      this.opened = false;
      this.legendtitle = "Kaartlagen en legenda's"
  }
  _shouldRender(props, changedProps, prevProps) {
      return (props.visible);
  }
  _render({opened, layerlist, legendtitle}) {
    /* see https://codepen.io/sulfurious/pen/eWPBjY?editors=1100 for flex layout */
    return html`
    <style>
        .container {
            position: absolute;
            display: flex;
            flex-direction: column;
            right: 45px;
            bottom: 30px;
            box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
            border-radius: 4px;
            max-height: 90%;
            max-width: 400px;
            background-color:white;
        }
        .legendheader {
            font-weight:bold;
            font-size:1.17em;
            border-bottom:1px solid lightblue;
            box-sizing: border-box;
            padding: 5px;
        }
        .itemscroller {            
            overflow:auto;
            display: flex;
            flex: 1;
            box-sizing: content-box;
            min-height: 0px; /* IMPORTANT: you need this for non-chrome browsers */
        }
        .button {
            position: absolute;
            bottom: 30px;
            right: 10px;
            box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
            border-radius: 4px;
            height: 30px;
            width: 30px;
            padding: 3px;
            background-color: white;
            visibility: visible;
            box-sizing: border-box;
        }
        .button:hover {
            background-color: whitesmoke;
        }
        .hidden {
            visibility: hidden;
        }
    </style>
    <div class$="container${opened? '' : ' hidden'}">
        <div class="legendheader">
            ${legendtitle}
        </div>
        <div class="itemscroller">
            <div class="itemlist">
                <div class="sortable">
                    ${layerlist.slice(1).reverse().map(item=>html`<map-legend-item layer=${item}></map-legend-item>`)}
                </div>
                <div class="legendfooter">
                    ${layerlist.slice(0,1).map(item=>html`<map-legend-item layer=${item} isbackground="true"></map-legend-item>`)}
                </div>
            </div>
        </div>
    </div>
    <div class="button" title=${legendtitle}>${layersIcon}</div>`
  }
  _didRender() {
    ;
  }
  _firstRendered() {
      if (this.visible) {
        this.shadowRoot.querySelector('.button').addEventListener('click', ()=>this.opened = !this.opened);
      }
  }
}

customElements.define('map-legend-container', MapLegendContainer);