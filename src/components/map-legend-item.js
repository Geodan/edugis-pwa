import {deleteForeverIcon} from './my-icons';
import {opacityIcon} from './my-icons';
import {styleIcon} from './my-icons';
import {visibilityIcon} from './my-icons';
import {visibilityOffIcon} from './my-icons';
import {expandMoreIcon} from './my-icons';
import {arrowRightIcon} from './my-icons';
import {arrowDropDownIcon} from './my-icons';
import {noIcon} from './my-icons';

import {panoramaWideIcon as areaIcon, showChartIcon as lineIcon, locationOnIcon as pointIcon, starIcon, tripOriginIcon as circleIcon, 
    blurOnIcon as heatmapIcon, textFieldsIcon as textIcon, gridOnIcon as rasterIcon, verticalAlignBottom as backgroundIcon, landscapeIcon } from './my-icons';

import './dragdrop/lit-draghandle';

import {LitElement, html} from '@polymer/lit-element';
class MapLegendItem extends LitElement {
  static get properties() { 
    return { 
      item: Object,
      isbackground: Boolean,
      layervisible: Boolean,
      _ga_id: String,
      open: Boolean,
      itemcontainer: Object,
      itemscroller: Object
    }; 
  }
  constructor() {
      super();
      this.item = {};
      this.isbackground = false;
      this.layervisible = true;
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
    this.layervisible = !this.layervisible;
    this.dispatchEvent(
        new CustomEvent('updatevisibility', 
            {
                detail: {
                    layerid: this.item.id, 
                    visible: this.layervisible,
                    _ga_id: this.item._ga_id
                },
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
  _render({item, isbackground, layervisible, itemcontainer, itemscroller}) {
    let layerIcon = undefined;
    if (!item._ga_group) {
        switch (item.type) {
            case "fill":
                layerIcon = areaIcon;
                break;
            case "line":
                layerIcon = lineIcon;
                break;
            case "symbol":
                layerIcon = textIcon;
                break;
            case "circle":
                layerIcon = circleIcon;
                break;
            case "heatmap":
                layerIcon = heatmapIcon;
                break;
            case "fill-extrusion":
                layerIcon = "3D";
                break;
            case "raster":
                layerIcon = rasterIcon;
                break;
            case "hillshade":
                layerIcon = landscapeIcon;
                break;
            case "background":
                layerIcon = backgroundIcon;
                break;
            default:
        }
    }
    return html`
    <style>
        :host {
            display:block;
        }
        .legenditem {
            border-bottom:1px solid lightgray;
            margin-bottom:2px;
            user-select: none;
            -moz-user-select: none;
            -webkit-user-select: none;
            -ms-user-select: none;
        }
        .header {
            cursor:'grab';
            background: white;
        }
        .header.sourcegroup {
            background: white;
        }
        .header.sourcelayergroup {
            background: white;
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
        .right .icon svg:hover {
            fill: dimgray;
        }
        .right {
            float: right;
        }
        lit-draghandle {
            width: 200px;
        }
        .indent {
            display: inline-block;
            width: 1em;
        }
    </style>
    <div class="legenditem">
        <div class$="header ${item.type?item.type:(item._ga_group?(item._ga_depth == 1?'sourcegroup':'sourcelayergroup'):'')}" layerid$="${item.id}">
            ${item._ga_indent ? new Array(item._ga_indent).fill(undefined).map(item=>html`<span class="indent"></span>`):''}
            ${item._ga_group ? 
                html`
                <i class="icon" title="Layer group" on-click="${e=>this._toggleOpenClose(e)}">
                ${item._ga_open?arrowDropDownIcon:arrowRightIcon}</i>`
                :
                html`
                <i class="icon">${layerIcon}</i>`}            
            <lit-draghandle itemcontainer="${itemcontainer}" itemscroller="${itemscroller}" isdraggable="${!isbackground}">
                ${item.id?item.id:(item["source-layer"]?item["source-layer"]:item.source)}
            </lit-draghandle>
            <span class="right">
                ${isbackground?'':html`<i class="icon" title="remove layer" on-click="${(e) => this._removeLayer(e)}" >${deleteForeverIcon}</i>`}
                <i class="icon" title="opacity">${opacityIcon}</i>
                ${(item._ga_group)?'':html`<i class="icon" title="change style">${styleIcon}</i>`} 
                <i class="icon" title$="${layervisible?'hide':'show'}" on-click="${(e) => this._toggleVisibility(e)}">${layervisible?visibilityOffIcon:visibilityIcon}</i>
                ${item._ga_group?undefined:html`<i class="icon" title="show legend" on-click="${e=>this._toggleOpenClose(e)}">${expandMoreIcon}</i>`}
            </span>
        </div>
        <!--div class$="content ${item.type}">Layer legenda</div-->
    </div>
    `
  }
}

customElements.define('map-legend-item', MapLegendItem);