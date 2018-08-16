
import {layersIcon} from './my-icons';
import {deleteForeverIcon} from './my-icons';
import {opacityIcon} from './my-icons';
import {styleIcon} from './my-icons';
import {visibilityIcon} from './my-icons';
import {visibilityOffIcon} from './my-icons';
import {expandMoreIcon} from './my-icons';


import {LitElement, html} from '@polymer/lit-element';
class MapLegendItem extends LitElement {
  static get properties() { 
    return { 
      layer: Object,
      isbackground: Boolean,
      visibility: Boolean
    }; 
  }
  constructor() {
      super();
      this.layer = {};
      this.isbackground = false;
      this.visibility = true;
  }
  _removeLayer(e) {
      console.log(this.shadowRoot.querySelector('.header').getAttribute('layerid'));
  }
  _toggleVisibility(e) {
    this.visibility = !this.visibility;
    this.dispatchEvent(
        new CustomEvent('updatevisibility', 
            {
                detail: {layerid: this.layer.id, visible: this.visibility},
                bubbles: true,
                composed: true
            }
        )
    );
  }
  _render({layer, isbackground, visibility}) {
    return html`
    <style>
        .legenditem {
            border-bottom:1px solid lightgray;
            margin-bottom:2px;
        }
        .header {
            
            cursor:${isbackground?'default':'grab'};
            background: lightgray;
        }
        .icon {
            display:inline-block;        
            width: 1em;
            height: 1em;
            cursor: pointer;
        }
        .icon svg {
            width: 16px;
            height: 16px;
        }
        .right {
            float: right;
        }
    </style>
    <div class="legenditem">
        <div class$="header ${layer.type}" layerid$="${layer.id}"><i class="icon" title="remove layer" on-click="${(e) => this._removeLayer(e)}" >${deleteForeverIcon}</i>${layer.id}<span class="right"><i class="icon" title="opacity">${opacityIcon}</i><i class="icon" title="change style">${styleIcon}</i> <i class="icon" title$=${visibility?"hide":"show"} on-click="${(e) => this._toggleVisibility(e)}">${visibility?visibilityOffIcon:visibilityIcon}</i> <i class="icon" title="expand legend">${expandMoreIcon}</i></span></div>
        <div class$="content ${layer.type}">Layer legenda</div>
    </div>
    `
  }
}

customElements.define('map-legend-item', MapLegendItem);