
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
      item: Object,
      isbackground: Boolean,
      visibility: Boolean,
      _ga_id: String,
      open: Boolean
    }; 
  }
  constructor() {
      super();
      this.item = {};
      this.isbackground = false;
      this.visibility = true;
      this._ga_id = '';
      this.open = false;
  }
  _removeLayer(e) {
      this.dispatchEvent(
          new CustomEvent('legendremovelayer',
            {
                detail: {layerid: this.item.id},
                bubbles: true,
                composed: true
            })
      );
  }
  _toggleVisibility(e) {
    this.visibility = !this.visibility;
    this.dispatchEvent(
        new CustomEvent('updatevisibility', 
            {
                detail: {layerid: this.item.id, visible: this.visibility},
                bubbles: true,
                composed: true
            }
        )
    );
  }
  _toggleOpenClose(e) {
      this.open = !this.open;
      this.dispatchEvent(
        new CustomEvent('openclose',
            {
                detail: {open: this.open, _ga_id: this.item._ga_id}
            }
        )
      );
  }
  _render({item, isbackground, visibility}) {
    return html`
    <style>
        :host {
            display:block;
        }
        .legenditem {
            border-bottom:1px solid lightgray;
            margin-bottom:2px;
        }
        .header {
            cursor:'grab';
            background: lightgray;
        }
        .header.sourcegroup {
            background: orange;
        }
        .header.sourcelayergroup {
            background: orangered;
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
        .draghandle {
            cursor: move;
        }        
    </style>
    <div class="legenditem">
        <div class$="header ${item.type?item.type:(item._ga_group?(item._ga_depth == 1?'sourcegroup':'sourcelayergroup'):'')}" layerid$="${item.id}">${isbackground?'':html`<i class="icon" title="remove layer" on-click="${(e) => this._removeLayer(e)}" >${deleteForeverIcon}</i>`}
            <span class$=${isbackground?'':"draghandle"} draggable$=${isbackground?"false":"true"}'}>${item.id?item.id:(item.source+(item["source-layer"]?item["source-layer"]:''))}</span>
            <span class="right">
                <i class="icon" title="opacity">${opacityIcon}</i>
                ${(item._ga_group)?'':html`<i class="icon" title="change style">${styleIcon}</i>`} 
                <i class="icon" title$=${visibility?"hide":"show"} on-click="${(e) => this._toggleVisibility(e)}">${visibility?visibilityOffIcon:visibilityIcon}</i>
                <i class="icon" title="expand legend" on-click="${e=>this._toggleOpenClose(e)}">${expandMoreIcon}</i>
            </span>
        </div>
        <div class$="content ${item.type}">Layer legenda</div>
    </div>
    `
  }
}

customElements.define('map-legend-item', MapLegendItem);