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
    blurOnIcon as heatmapIcon, textFieldsIcon as textIcon, gridOnIcon as rasterIcon, verticalAlignBottom as backgroundIcon, landscapeIcon, zoomInIcon, zoomOutIcon } from './my-icons';

import './dragdrop/lit-draghandle';

import {LitElement, html} from '@polymer/lit-element';
class MapLegendItem extends LitElement {
  static get properties() { 
    return { 
      item: Object,
      isbackground: Boolean,
      layervisible: Boolean,
      slidervisible: Boolean,
      layeropacity: Number,
      _ga_id: String,
      open: Boolean,
      itemcontainer: Object,
      itemscroller: Object,
      zoom: Number
    }; 
  }
  constructor() {
      super();
      this.item = {};
      this.isbackground = false;
      this.layervisible = true;
      this.slidervisible = false;
      this.layeropacity = 100;
      this._ga_id = '';
      this.open = false;
      this.zoom = 0;
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
    if (this.toggleDebounce) {
        return;
    }
    this.toggleDebounce = true;
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
    setTimeout(()=>this.toggleDebounce = false, 500);
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
  toggleSlider(e) {
      this.slidervisible = !this.slidervisible;
  }
  updateOpacity(e) {
      this.layeropacity = parseInt(e.target.value);
      this.dispatchEvent(new CustomEvent('updateopacity', {
          detail: {
            layerid: this.item.id, 
            opacitypercentage: this.layeropacity,
            opacity: this.layeropacity / 100,
            _ga_id: this.item._ga_id
          },
          bubbles: true,
          composed: true
      }));
  }
  _render({item, isbackground, layervisible, slidervisible, layeropacity, itemcontainer, itemscroller, zoom}) {
    let layerIcon = undefined;
    let layerViewIcon = '';
    if (item.maxzoom && zoom > item.maxzoom) {
        layerViewIcon = zoomOutIcon;
    } else {
        if (item.minzoom && zoom < item.minzoom) {
            layerViewIcon = zoomInIcon;
        } else {
            layerViewIcon = expandMoreIcon;
        }
    }
    const layerOnMap = layervisible && (!item.maxzoom || zoom < item.maxzoom) && (!item.minzoom || zoom > item.minzoom);
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
    const sliderstyle = html`
<style>
  input[type=range] {
  -webkit-appearance: none;
  width: 100%;
  margin: 3.85px 0;
}
input[type=range]:focus {
  outline: none;
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4.3px;
  cursor: pointer;
  box-shadow: 0.1px 0.1px 2px #000000, 0px 0px 0.1px #0d0d0d;
  background: #d4d3d3;
  border-radius: 1.3px;
  border: 0.2px solid #010101;
}
input[type=range]::-webkit-slider-thumb {
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border: 1px solid #000000;
  height: 12px;
  width: 14px;
  border-radius: 3px;
  background: #ffffff;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -4.05px;
}
input[type=range]:focus::-webkit-slider-runnable-track {
  /*background: linear-gradient(to right, #ffffff 0%, #000000 100%);*/
  background: #a4a3a3;
}
input[type=range]::-moz-range-track {
  width: 100%;
  height: 4.3px;
  cursor: pointer;
  box-shadow: 0.1px 0.1px 2px #000000, 0px 0px 0.1px #0d0d0d;
  background: #d4d3d3;
  border-radius: 1.3px;
  border: 0.2px solid #010101;
}
input[type=range]::-moz-range-thumb {
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border: 1px solid #000000;
  height: 12px;
  width: 14px;
  border-radius: 3px;
  background: #ffffff;
  cursor: pointer;
}
input[type=range]::-ms-track {
  width: 100%;
  height: 4.3px;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  color: transparent;
}
input[type=range]::-ms-fill-lower {
  background: #c7c6c6;
  border: 0.2px solid #010101;
  border-radius: 2.6px;
  box-shadow: 0.1px 0.1px 2px #000000, 0px 0px 0.1px #0d0d0d;
}
input[type=range]::-ms-fill-upper {
  background: #d4d3d3;
  border: 0.2px solid #010101;
  border-radius: 2.6px;
  box-shadow: 0.1px 0.1px 2px #000000, 0px 0px 0.1px #0d0d0d;
}
input[type=range]::-ms-thumb {
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border: 1px solid #000000;
  height: 12px;
  width: 14px;
  border-radius: 3px;
  background: #ffffff;
  cursor: pointer;
  height: 4.3px;
}
input[type=range]:focus::-ms-fill-lower {
  background: #d4d3d3;
}
input[type=range]:focus::-ms-fill-upper {
  background: #e1e0e0;
}
</style>`;
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
        .gray {
            color: gray;
        }
        .slidercontainer {
            position: relative;
            height: 20px;
            top: -10px;
        }
        .slider {
            position: absolute;
            right: 20px;
            width: 200px;
        }
        .percentage {
            position: absolute;
            right: 205px;
            text-align: right;
            font-size: smaller;
            top: 3px;
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
            <lit-draghandle class$="${layerOnMap?undefined:'gray'}" itemcontainer="${itemcontainer}" itemscroller="${itemscroller}" isdraggable="${!isbackground}">
                ${item.id?item.id:(item["source-layer"]?item["source-layer"]:item.source)}
            </lit-draghandle>
            <span class="right">
                ${isbackground?'':html`<i class="icon" title="remove layer" on-click="${(e) => this._removeLayer(e)}" >${deleteForeverIcon}</i>`}
                <i class="icon" title="opacity" on-click="${e=>this.toggleSlider()}">${opacityIcon}</i>
                ${(item._ga_group)?'':html`<i class="icon" title="change style">${styleIcon}</i>`} 
                <i class="icon" title$="${layervisible?'hide':'show'}" on-click="${(e) => this._toggleVisibility(e)}">${layervisible?visibilityOffIcon:visibilityIcon}</i>
                ${item._ga_group?undefined:html`<i class="icon" title="show legend" on-click="${e=>this._toggleOpenClose(e)}">${layerViewIcon}</i>`}
            </span>
        </div>
        ${slidervisible ?
            html`${sliderstyle}<div class="slidercontainer"><div class="slider"><span class="percentage">${layeropacity}%</span><input type="range" on-input="${e=>this.updateOpacity(e)}" value="${layeropacity}"></div></div>`
            :
            html``
        }        
        <!--div class$="content ${item.type}">Layer legenda</div-->
    </div>
    `
  }
}

customElements.define('map-legend-item', MapLegendItem);