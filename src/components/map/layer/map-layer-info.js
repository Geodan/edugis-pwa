import {html, css, LitElement} from 'lit-element';
import '../../base/base-slider.js';
import '../../map-legend-panel.js';
import './map-layer-config.js';
import {iconInformationCircle, iconCog, iconDelete} from "./map-layer-icons.js";
//import Picker from '../../colorpicker/picker.js';

/**
* @polymer
* @extends HTMLElement
*/
class MapLayerInfo extends LitElement {
    static get properties() {
        return {
            layer: {type: Object},
            open: {type: Boolean},
            layervisible: {type: Boolean},
            moreInfo: {type: Boolean},
            showLayerConfig: {type: Boolean},
            transparency: {type: Number},
            legendclipper: {type: Boolean},
            legendclipped: {type: Boolean},
            zoom: {type:Number},
            datagetter: {type: Object},
            updatelegend: {type: Number}
        }
    }
    static get styles() {
        return css`
            :host {
                display: inline-block;
            }
            #licontainer {
                padding-left: 26px;
            }
            #litransparency {
                margin-top: 10px;
            }
            #lilegendtitle {
                margin-bottom: 10px;
            }
            #lishowmore {
                color: #2E7DBA;
                font-style: italic;
                position: relative;
                cursor: pointer;
            }
            .bold {
                font-weight: bold;
            }
            .lislidercontainer {
                margin-top: -10px;
                height: 40px;
                width: 180px;
                margin-left: 7px;
                --mdc-theme-primary: #ccc;
                --mdc-theme-secondary: #555;
            }
            .icon {
                display: inline-block;
                width: 24px;
                height: 24px;
                vertical-align:middle;
            }
            .fade {
                background: linear-gradient(to bottom, rgba(255, 255, 255,0) 0%,rgba(255, 255, 255,1) 75%);
                height: 100px;
                margin-top: -100px;
                position: relative;
            }
            #legend {
                max-height: 3000px;
                overflow: hidden;
                transition: max-height .8s ease-in-out;
            }
            #legend.clipped {
                max-height: 200px;
            }
            .iconbutton {
                padding: 5px;
                cursor: pointer;
            }
            .moreinfo {
                padding-left: 20px;
                max-width: 200px;
                overflow: auto;
            }
        `
    }
    constructor() {
        super();
        this.layer = null;
        this.open = false;
        this.moreInfo = false;
        this.showLayerConfig = false;
        this.transparency = 0;
        this.legendclipper = true;
        this.legendclipped = true;
        this.zoom = 0;
        this.datagetter = null;
        this.updatelegend = 0;
    }
    shouldUpdate(changedProperties) {
        if (changedProperties.has('layer')) {
            this.moreInfo = false;
            this.showLayerConfig = false;
            if (this.layer && this.layer.metadata) {
                this.transparency = this.layer.metadata.transparency?this.layer.metadata.transparency:this._getTransparency();
                this.legendclipped = true;
            }
        }
        return true;
    }
    render() {
        // <button @click="${(e)=>this._buttonClick(e)}">colors</button>
        return html`
        <div id="licontainer">
            ${this._renderVisibleLayerInfo()}
            <div class="iconbutton" @click="${()=>this._removeLayer()}"><span class="icon">${iconDelete}</span> Verwijderen</div>
        </div>
        `
    }
    _getTransparency() {
        if (this.layer.paint) {
            let opacityname = this.layer.type==='hillshade'?'hillshade-exaggeration':`${this.layer.type}-opacity`;
            if (this.layer.paint.hasOwnProperty(opacityname)) {
                return Math.round(100*(1 - this.layer.paint[opacityname]));
            }
        } else if (this.layer.type === 'style') {
            for (let type of ["hillshade","fill","raster","circle","line","fill-extrusion","heatmap","sky","symbol","background"]) {
                let layer = this.layer.metadata.sublayers.find(layer=>layer.type === type);                
                if (layer && layer.paint) {
                    let opacityname = layer.type==='hillshade'?'hillshade-exaggeration':`${layer.type}-opacity`;
                    if (layer.paint.hasOwnProperty(opacityname)) {
                        return Math.round(100*(1 - layer.paint[opacityname]));
                    }
                    return 0;
                }
            }
        }
        return 0;
    }
    _renderVisibleLayerInfo() {
        if (this.layervisible && this.open) {
            return html`
            <div id="litransparency"><span class="bold">Transparantie:</span> ${Math.round(this.transparency)}%
                <div class="lislidercontainer">
                    <base-slider id="${this.layer.id}" value="${this.transparency}" minvalue="0" maxvalue="100" @change="${e=>this._updateTransparency(e)}"></base-slider>
                </div>
            </div>
            <div id="lilegend">
                <div id="lilegendtitle" class="bold">Legenda:</div>
                <div id="legend" class="${this.legendclipped?' clipped':''}">
                    <map-legend-panel 
                        @load="${()=>this.requestUpdate()}" 
                        .maplayer="${this.layer}"
                        transparency="${this.transparency}"
                        .zoom="${this.zoom}"
                        .updatelegend="${this.updatelegend}"></map-legend-panel>
                </div>
                ${this._renderLegendClipper()}
            </div>
            ${this._renderShowInfo()}
            ${this._renderSettings()}
            `
        }
        return ``;
    }
    _renderLegendClipper() {
        if (this.legendclipper) {
            return html`
                ${this.legendclipped?html`<div class="fade"></div>`:""}
                <div id="lishowmore" @click="${()=>this._togglelegendclipped()}">Toon ${this.legendclipped?'meer':'minder'}...</div>
            `
        }
        return '';
    }
    updated() {
        requestAnimationFrame(()=>{
                let legendPanel = this.shadowRoot.querySelector('map-legend-panel');            
                if (legendPanel) {
                    this.legendclipper = legendPanel.offsetHeight > 220;
                    if (!this.legendclipper) {
                        this.legendclipped = false;
                    } else {
                        this.legendclipped = this.layer.metadata.hasOwnProperty('legendclipped')?this.layer.metadata.legendclipped:true;
                    }
                }
            }
        )
    }
    _buttonClick(event) {
        let button = this.shadowRoot.querySelector('#licontainer');
        //let picker = new Picker({parent:document.body, popup:'top'});
        //picker.openHandler();
    }
    _togglelegendclipped() {
        this.legendclipped = !this.legendclipped;
        this.layer.metadata.legendclipped = this.legendclipped;        
    }
    _renderLinks(text) {
        let matches = text.matchAll(/https?:\/\/[^,;\s)]*/g);
        let prevpos = 0;
        let parts = [];
        for (let match of matches) {
            if (match.index > prevpos) {
                parts.push([match.input.substr(prevpos, match.index), match[0]]);
            } else {
                nonlinks.push(['', match[0]]);
            }
            prevpos = match.index + match[0].length;
        }
        if (parts.length) {
            if (prevpos !== text.length) {
                parts.push([text.substr(prevpos, text.length), '']);
            }
            return parts.map(part=>html`${part[0]}${part[1] !== ''?html`<a href="${part[1]}" target="_blank">${part[1]}</a>`:''}`)
        } else {
            return html`${text}`
        }
    }
    _renderShowInfo() {
        if (this.layer.metadata) {
            if (this.layer.metadata.markdown && this.layer.metadata.markdown.trim() !== "") {
                return html`
                    <div class="iconbutton" @click="${()=>this._toggleInfo()}"><span class="icon">${iconInformationCircle}</span> Meer informatie</div>
                `
            }
            if (this.layer.metadata.abstract && this.layer.metadata.abstract.trim() !== "") {
                return html`
                    <div class="iconbutton" @click="${()=>this._toggleInfo()}"><span class="icon">${iconInformationCircle}</span> Meer informatie</div>
                    ${this.moreInfo?html`<div class="moreinfo">${this._renderLinks(this.layer.metadata.abstract)}</div>`:""}
                `
            }
        }
    }
    _toggleInfo() {
        this.moreInfo = !this.moreInfo;
        if (this.moreInfo && this.layer.metadata.markdown) {
            this.moreInfo = false;
            this.dispatchEvent(new CustomEvent("showmodaldialog", {
                detail: {
                    markdown: this.layer.metadata.markdown
                },
                bubbles: true,
                composed: true
            }))
        }
    }

    _renderLayerConfig() {
        if (this.showLayerConfig) {
            return html`
            <map-layer-config .layer="${this.layer}" .zoom=${this.zoom} .datagetter="${this.datagetter}"></map-layer-config>
            `
        } else {
            return '';
        }
    }
    _renderSettings(){
        if (this.layer.type === 'fill' || this.layer.type === 'line' || this.layer.type === 'circle') {
            return html`
                <div class="iconbutton" @click="${()=>this.showLayerConfig=!this.showLayerConfig}"><span class="icon">${iconCog}</span> Instellingen</div>
                ${this._renderLayerConfig()}
            `
        }
        return '';
    }
    _removeLayer() {
        this.dispatchEvent(new CustomEvent('removelayer', {
            detail: {
                layerid: this.layer.id
            },
            bubbles: true,
            composed: true
        }))
    }
    _updateTransparency(event) {
        this.transparency = event.target.value;
        this.layer.metadata.transparency = this.transparency;
        this.dispatchEvent(new CustomEvent('updateopacity', {
            detail: {
                layerid: this.layer.metadata && this.layer.metadata.sublayers?this.layer.metadata.sublayers.map(layer=>layer.id):this.layer.id,
                opacity: 1 - (Math.round(this.transparency) / 100)
            },
            bubbles: true,
            composed: true
        }))
    }
}

window.customElements.define('map-layer-info', MapLayerInfo);