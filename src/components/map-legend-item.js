
import {layersIcon} from './my-icons';
import {deleteForeverIcon} from './my-icons';
import {opacityIcon} from './my-icons';
import {styleIcon} from './my-icons';
import {visibilityIcon} from './my-icons';
import {expandMoreIcon} from './my-icons';


import {LitElement, html} from '@polymer/lit-element';
class MapLegendItem extends LitElement {
  static get properties() { 
    return { 
      layer: Object,
      isbackground: Boolean
    }; 
  }
  constructor() {
      super();
      this.layer = {};
      this.isbackground = false;
  }
  _render({layer, isbackground}) {
    return html`
    <style>
        .legenditem {
            border-bottom:1px solid lightgray;
            margin-bottom:2px;
        }
        .header {
            box-sizing: border-box;
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
    </style>
    <div class="legenditem">
        <div class="header"><i class="icon" title="remove">${deleteForeverIcon}</i> legenda-item 1 en nog wat <i class="icon" title="opacity">${opacityIcon}</i><i class="icon" title="change style">${styleIcon}</i> <i class="icon" title="hide">${visibilityIcon}</i> <i class="icon" title="expand legend">${expandMoreIcon}</i></div>
        <div class="content">jawel!</div>
    </div>
    `
  }
}

customElements.define('map-legend-item', MapLegendItem);