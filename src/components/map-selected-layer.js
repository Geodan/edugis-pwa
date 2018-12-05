import {LitElement, html} from '@polymer/lit-element';
import {settingsIcon, 
  visibleCircleIcon,
  invisibleCircleIcon, 
  arrowOpenedCircleIcon, 
  trashBinCircleIcon} from './my-icons';
import {panoramaWideIcon as areaIcon, showChartIcon as lineIcon, tripOriginIcon as circleIcon, 
    blurOnIcon as heatmapIcon, textFieldsIcon as textIcon, gridOnIcon as rasterIcon, 
    verticalAlignBottom as backgroundIcon, landscapeIcon, zoomInIcon, zoomOutIcon } from './my-icons';

import './map-slider';
import './map-legend-panel';

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l){
  var r, g, b;

  s = s / 100;
  l = l / 100;
  if(s == 0){
      r = g = b = l; // achromatic
  }else{
      var hue2rgb = function hue2rgb(p, q, t){
          if(t < 0) t += 1;
          if(t > 1) t -= 1;
          if(t < 1/6) return p + (q - p) * 6 * t;
          if(t < 1/2) return q;
          if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
      }

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function colorToHex(colorString) {
  colorString = colorString.replace(' ', '');
  if (colorString.startsWith('#')) {
    if (colorString.length === 4) {
      colorString = colorString.split('').map((char,index)=>index?char+char:char).join('');
    }
    return colorString;
  }
  if (colorString.startsWith('hsl(')) {
    colorString = colorString.substring(4).split(',').map(value=>parseFloat(value));
    const rgb = hslToRgb(colorString[0], colorString[1], colorString[2]);
    return "#" + rgb[0].toString(16) + rgb[1].toString(16) + rgb[2].toString(16);
  }
  if (colorString.startsWith('hsla(')) {
    colorString = colorString.substring(5).split(',').map(value=>parseFloat(value));
    const rgb = hslToRgb(colorString[0], colorString[1], colorString[2]);
    return "#" + rgb[0].toString(16) + rgb[1].toString(16) + rgb[2].toString(16);
  }
}

/**
* @polymer
* @extends HTMLElement
*/
class MapSelectedLayer extends LitElement {
  static get properties() { 
    return { 
      active: {type: Boolean},
      layer: {type: Object},
      zoom: {type: Number},
      updatecount: {type: Number},
      datagetter: {type: Object},
    }; 
  }
  constructor() {
    super();
    this.active = true;
    this.layer = undefined;
    this.zoom = 0;
    this.updatecount = 0;
    this.percentage = 100;
    this.inrange = true;
    this.datagetter = {};
  }
  checkZoomRange()
  {
    const minzoom = this.layer.minzoom ? this.layer.minzoom : 0;
    const maxzoom = this.layer.maxzoom ? this.layer.maxzoom : 24;
    this.outofrange = this.zoom < minzoom || this.zoom > maxzoom;
  }
  shouldUpdate(changedProps) {
    if (changedProps.has('zoom')) {
      this.checkZoomRange();
    }
    if (changedProps.has('layer')) {
      // set layer defaults
      if (this.layer) {
        this.checkZoomRange();
        if (!this.layer.metadata) {
          this.layer.metadata = {};
        }
      }
      if (!this.layer.metadata.hasOwnProperty('legendvisible')) {
        this.layer.metadata.legendvisible = ((!this.layer.metadata.reference) && this.layer.type !== "background");
      }
    }
    return this.active;
  }
  render() {
    return html`<style>
    .layercontainer {
      display: block;
      background: white;
      border-radius: 4px;
      padding: 10px;
      margin-top: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px;
    }
    .layercontainer:hover {
      box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
    }
    .titlebox {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .layertitle {
      text-align: center;
    }
    .lightgray {
      color: #ccc;
      fill: #ccc;
    }
    .iconbox {
      width: 86px;
      display: flex;
      justify-content: flex-end;
    }
    .iconcontainer {
      display: inline-block;
      cursor: pointer;
    }
    .closed {
      transform: rotate(-90deg);
      transform-origin: 13px 13px;
    }
    .legendcontainer {
      margin-top: 4px;
      border-top: 1px solid #F3F3F3;
      padding-top: 4px;
    }
    </style>
    <div class="layercontainer">
      <div class="titlebox">
        <div class="${this.outofrange || this.layer.metadata.layervisible === false ?' lightgray':''}">${this.getIcon(this.layer.type)}</div> 
        <div class="layertitle${this.outofrange || this.layer.metadata.layervisible === false ?' lightgray':''}">${this.layer.metadata && this.layer.metadata.title?this.layer.metadata.title:this.layer.id}</div>
        <div class="iconbox">
          <div title="zichtbaarheid" class="iconcontainer" @click="${e=>this.toggleVisibility(e)}">${this.layer && this.layer.metadata && this.layer.metadata.layervisible === false?invisibleCircleIcon:visibleCircleIcon}</div>
          ${(!this.outofrange) && this.layer.metadata && this.layer.metadata.legendvisible && this.layer.metadata.layervisible !== false?
            html`          
              <div title="instellingen" class="iconcontainer" @click="${e=>this.toggleSettings(e)}">${settingsIcon}</div>`
          : html``}
          ${this.layer.metadata && this.layer.metadata.layervisible !== false ? 
            html`<div title="inklappen" class="iconcontainer${this.layer.metadata && this.layer.metadata.legendvisible?'':' closed'}" @click="${e=>this.toggleLegend(e)}">${arrowOpenedCircleIcon}</div>`
          : html``}
        </div>
      </div>
      ${this.renderSettings()}
      ${this.renderLegend()}
    </div>
    `;
  }
  getIcon(type) {
    let layerIcon = '';
    switch (type) {
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
          break;
    }
    return layerIcon;
  }
  renderLegend(){
    if (this.layer && 
        this.layer.metadata && 
        this.layer.metadata.legendvisible &&
        this.layer.metadata.layervisible !== false ) {
      if (this.outofrange) {
        if (this.zoom < this.layer.minzoom) {
          return html`<div class="legendcontainer">Zoom verder in</div>`
        } else {
          return html`<div class="legendcontainer">Zoom verder uit</div>`
        }
      }
      return html`<div class="legendcontainer">
        <map-legend-panel .maplayer="${this.layer}" .zoom="${this.zoom}"></map-legend-panel>
      </div>`;
    }
    return html``;
  }
  toggleLegend(e) {
    if (!this.layer.metadata) {
      this.layer.metadata = {};
    }
    this.layer.metadata.legendvisible = !this.layer.metadata.legendvisible;
    this.updatecount++;
  }
  renderSettings() {
    if (this.layer && this.layer.metadata && 
        this.layer.metadata.legendvisible &&
        this.layer.metadata.settingsvisible &&
        (!this.outofrange) &&
        this.layer.metadata.layervisible !== false) {
      if (!this.layer.metadata.hasOwnProperty('opacity')) {
        this.layer.metadata.opacity = 100;
      }
      return html`
      <style>
        .settingscontainer, .trashbincontainer {
          margin-top: 10px;
        }
        .transparencycontainer, .trashbincontainer {
          border-top: 1px solid #F3F3F3;
          padding-top: 4px;
        }
        .slidercontainer {
          margin-top: -10px;
          height: 40px;
          width: 168px;
          margin-left: 7px;
          --mdc-theme-primary: #ccc;
          --mdc-theme-secondary: #555;
        }
        .trashbinicon {
          float: right;
          cursor: pointer;
        }
        .percentage {
          display: inline-block;
          line-height: 14px;
          margin-left: 8px;
        }
        .label {
          display: inline-block;
          top: 10px;
          font-weight: bold;
        }
        .trashtext {
          padding-top: 10px;
        }
      </style>
      <div class="settingscontainer">
        <div class="transparencycontainer">
          <div class="label">Transparantie:</div><div class="percentage">${100-this.layer.metadata.opacity}%</div>
          <div class="slidercontainer">
            <map-slider @slidervaluechange="${e=>this.updateTransparency(e)}" value="${100-this.layer.metadata.opacity}"></map-slider>
          </div>
        </div>
        <div class="trashbincontainer">
          <div class="label">Kaartlaag verwijderen</div>
          <div class="trashbinicon" @click="${e=>this.removeLayer(e)}" title="kaartlaag verwijderen">${trashBinCircleIcon}</div>
          <div class="trashtext">De laag kan weer toegevoegd worden via het data-catalogus menu</div>
        </div>
        <div class="editlegend">
        ${this.renderLegendEditor()}
        </div>
      </div>`
    }
  }
  renderLegendEditor()
  {
    let data;
    if (this.datagetter && this.datagetter.querySourceFeatures) {
      data = this.datagetter.querySourceFeatures(this.layer.source, {sourceLayer: this.layer["source-layer"]});
    }
    console.log(`number of elements: ${data.length}`);
    if (data.length) {
      const properties = {...data[0].properties};
      const minmaxproperties = {min:{}, max:{}};
      for (let key in properties) {
        if (typeof properties[key] === "number") {
          minmaxproperties.min[key] = Number.MAX_VALUE;
          minmaxproperties.max[key] = Number.MIN_VALUE;
        } else if (typeof properties[key] === "string") {
          minmaxproperties.min[key] = "zzzzzzz";
          minmaxproperties.max[key] = "";
        }
      }
      console.log(data.reduce((minmaxproperties, feature)=>{
        for (let key in feature.properties) {
          if (feature.properties[key] > minmaxproperties.max[key]) {
            minmaxproperties.max[key] = feature.properties[key];
          }
          if (feature.properties[key] < minmaxproperties.min[key]) {
            minmaxproperties.min[key] = feature.properties[key];
          }
        }
        return minmaxproperties;
      }, minmaxproperties));
    }
    switch (this.layer.type) {
      case "fill":
        {
          const paint = this.layer.paint;
          let fillColor = paint["fill-color"];
          let outlineColor = paint["fill-outline-color"];
          if (typeof fillColor === "string" && typeof outlineColor === "string")
          {
            fillColor = colorToHex(fillColor);
            outlineColor = colorToHex(outlineColor);
            return html`
            <style>
              .legendeditcontainer {
                border-top: 1px solid #F3F3F3;
                padding-top: 4px;
              }
            </style>
            <div class="legendeditcontainer">
            <input id="fillcolor" type="color" value="${fillColor}" @input="${e=>this.updatePaintProperty(e, {fillcolor: e.currentTarget.value})}"> <label for="fillcolor">vlakkleur</label><br>
            <input id="linecolor" type="color" value="${outlineColor}" @input="${e=>this.updatePaintProperty(e, {filloutlinecolor: e.currentTarget.value})}"> <label for="linecolor">lijnkleur</label>
            </div>
            `
          } else if (typeof fillColor === "string") {
            return html`
            <style>
              .legendeditcontainer {
                border-top: 1px solid #F3F3F3;
                padding-top: 4px;
              }
            </style>
            <div class="legendeditcontainer">
            <input id="fillcolor" type="color" value="${fillColor}" @input="${e=>this.updatePaintProperty(e, {fillcolor: e.currentTarget.value})}"> <label for="fillcolor">vlakkleur</label>
            </div>
            `
          }
        }
        break;
      case "line":
        {
          const paint = this.layer.paint;
          let lineColor = paint["line-color"];
          let lineWidth = paint["line-width"];
          if (typeof lineColor === "string") {
            lineColor = colorToHex(lineColor);
            return html`
            <style>
              .legendeditcontainer {
                border-top: 1px solid #F3F3F3;
                padding-top: 4px;
              }
              .sliderwidthcontainer {
                height: 40px;
                width: 168px;
                --mdc-theme-primary: #ccc;
                --mdc-theme-secondary: #555;
              }
            </style>
            <div class="legendeditcontainer">
            <input id="linecolor" type="color" value="${lineColor}" @input="${e=>this.updatePaintProperty(e, {linecolor: e.currentTarget.value})}"> <label for="fillcolor">lijnkleur</label>
            <div class="sliderwidthcontainer">
              Lijndikte: ${lineWidth}
              <map-slider @slidervaluechange="${e=>{this.layer.paint['line-width'] = e.detail.value / 10; this.updatePaintProperty(e, {linewidth: e.detail.value / 10})}}" value="${1 * lineWidth}"></map-slider>
            </div>
            </div>
            `
          }
        }
      default:
        break;
    }
    
    return html``;
  }
  updatePaintProperty(e, propertyInfo)
  {
    //console.log(e.currentTarget.value);
    propertyInfo.layerid = this.layer.id;
    this.dispatchEvent(new CustomEvent('changepaintproperty', {
      detail: propertyInfo,
      bubbles: true,
      composed: true,
    }));
    this.updatecount++;
  }
  toggleSettings(e) {
    if (!this.layer.metadata) {
      this.layer.metadata = {};
    }
    this.layer.metadata.settingsvisible = !this.layer.metadata.settingsvisible;
    this.updatecount++;
  }
  toggleVisibility(e) {
    if (this.toggleDebounce) {
        return;
    }
    this.toggleDebounce = true;
    if (!this.layer || !this.layer.metadata) {
      return;
    }
    this.updatecount++;
    if (this.layer.metadata.hasOwnProperty('layervisible')) {
      this.layer.metadata.layervisible = !this.layer.metadata.layervisible;
    } else {
      this.layer.metadata.layervisible = false;
    }
    this.dispatchEvent(
      new CustomEvent('updatevisibility', 
        {
          detail: {
            layerid: this.layer.id, 
            visible: this.layer.metadata.layervisible,
          },
          bubbles: true,
          composed: true
        }
      )
    );
    setTimeout(()=>this.toggleDebounce = false, 500);
  }
  updateTransparency(e) {
    this.layer.metadata.opacity = 100-Math.round(e.detail.value);
    e.detail.layerid = this.layer.id;
    this.updatecount++;
    this.dispatchEvent(
      new CustomEvent('updateopacity', 
        {
          detail: {
            layerid: this.layer.id, 
            opacity: this.layer.metadata.opacity / 100.0,
          },
          bubbles: true,
          composed: true
        }
      )
    );
  }
  removeLayer(e) {
    this.dispatchEvent(
      new CustomEvent('removelayer',
        {
          detail: {layerid: this.layer.id},
          bubbles: true,
          composed: true
        })
    );
  }
}
customElements.define('map-selected-layer', MapSelectedLayer);
