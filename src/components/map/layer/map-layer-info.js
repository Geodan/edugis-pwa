import {html, css, LitElement} from 'lit-element';
import '../../base/base-slider.js';
import '../../map-legend-panel.js';
import './map-layer-config.js';
import {iconInformationCircle, iconCog, iconDelete} from "./map-layer-icons.js";
import Picker from '../../colorpicker/picker.js';

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
            }
            .hide {
                display: none;
            }
            .picker_wrapper.no_alpha .picker_alpha {display:none}
    .picker_wrapper.no_editor .picker_editor{position:absolute;z-index:-1;opacity:0}
    .picker_wrapper.no_cancel .picker_cancel{display:none}
    .layout_default.picker_wrapper{display:-webkit-box;display:flex;-webkit-box-orient:horizontal;-webkit-box-direction:normal;flex-flow:row wrap;-webkit-box-pack:justify;justify-content:space-between;-webkit-box-align:stretch;align-items:stretch;font-size:10px;width:25em;padding:.5em}
    .layout_default.picker_wrapper input,.layout_default.picker_wrapper button{font-size:1rem}
    .layout_default.picker_wrapper>*{margin:.5em}
    .layout_default.picker_wrapper::before{content:\'\';display:block;width:100%;height:0;-webkit-box-ordinal-group:2;order:1}
    .layout_default .picker_slider,.layout_default .picker_selector{padding:1em}
    .layout_default .picker_hue{width:100%}
    .layout_default .picker_sl{-webkit-box-flex:1;flex:1 1 auto}
    .layout_default .picker_sl::before{content:\'\';display:block;padding-bottom:100%}
    .layout_default .picker_palette{order:1;width:100%;display:flex;align-items:stretch;}
    .layout_default .picker_palette div {height: 20px; min-width:1px; flex-grow: 1;}
    .layout_default .picker_editor{-webkit-box-ordinal-group:2;order:1;width:6.5rem}
    .layout_default .picker_editor input{width:100%;height:100%}
    .layout_default .picker_sample{-webkit-box-ordinal-group:2;order:1;-webkit-box-flex:1;flex:1 1 auto}
    .layout_default .picker_done,.layout_default .picker_cancel{-webkit-box-ordinal-group:2;order:1}
    .picker_wrapper{box-sizing:border-box;background:#f2f2f2;box-shadow:0 0 0 1px silver;cursor:default;font-family:sans-serif;color:#444;pointer-events:auto}
    .picker_wrapper:focus{outline:none}
    .picker_wrapper button,.picker_wrapper input{box-sizing:border-box;border:none;box-shadow:0 0 0 1px silver;outline:none}
    .picker_wrapper button:focus,.picker_wrapper button:active,.picker_wrapper input:focus,.picker_wrapper input:active{box-shadow:0 0 2px 1px dodgerblue}
    .picker_wrapper button{padding:.4em .6em;cursor:pointer;background-color:whitesmoke;background-image:-webkit-gradient(linear, left bottom, left top, from(gainsboro), to(transparent));background-image:-webkit-linear-gradient(bottom, gainsboro, transparent);background-image:linear-gradient(0deg, gainsboro, transparent)}
    .picker_wrapper button:active{background-image:-webkit-gradient(linear, left bottom, left top, from(transparent), to(gainsboro));background-image:-webkit-linear-gradient(bottom, transparent, gainsboro);background-image:linear-gradient(0deg, transparent, gainsboro)}
    .picker_wrapper button:hover{background-color:white}
    .picker_selector{position:absolute;z-index:1;display:block;-webkit-transform:translate(-50%, -50%);transform:translate(-50%, -50%);border:2px solid white;border-radius:100%;box-shadow:0 0 3px 1px #67b9ff;background:currentColor;cursor:pointer}
    .picker_slider .picker_selector{border-radius:2px}
    .picker_hue{position:relative;background-image:-webkit-gradient(linear, left top, right top, from(red), color-stop(yellow), color-stop(lime), color-stop(cyan), color-stop(blue), color-stop(magenta), to(red));background-image:-webkit-linear-gradient(left, red, yellow, lime, cyan, blue, magenta, red);background-image:linear-gradient(90deg, red, yellow, lime, cyan, blue, magenta, red);box-shadow:0 0 0 1px silver}
    .picker_sl{position:relative;box-shadow:0 0 0 1px silver;background-image:-webkit-gradient(linear, left top, left bottom, from(white), color-stop(50%, rgba(255,255,255,0))),-webkit-gradient(linear, left bottom, left top, from(black), color-stop(50%, rgba(0,0,0,0))),-webkit-gradient(linear, left top, right top, from(gray), to(rgba(128,128,128,0)));background-image:-webkit-linear-gradient(top, white, rgba(255,255,255,0) 50%),-webkit-linear-gradient(bottom, black, rgba(0,0,0,0) 50%),-webkit-linear-gradient(left, gray, rgba(128,128,128,0));background-image:linear-gradient(180deg, white, rgba(255,255,255,0) 50%),linear-gradient(0deg, black, rgba(0,0,0,0) 50%),linear-gradient(90deg, gray, rgba(128,128,128,0))}
    .picker_alpha,.picker_sample,.picker_palette{position:relative;background:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'2\' height=\'2\'%3E%3Cpath d=\'M1,0H0V1H2V2H1\' fill=\'lightgrey\'/%3E%3C/svg%3E") left top/contain white;box-shadow:0 0 0 1px silver}
    .picker_alpha .picker_selector,.picker_sample .picker_selector{background:none}
    .picker_editor input{font-family:monospace;padding:.2em .4em}
    .picker_sample::before{content:\'\';position:absolute;display:block;width:100%;height:100%;background:currentColor}
    .picker_arrow{position:absolute;z-index:-1}
    .picker_wrapper.popup{position:absolute;z-index:2;margin:1.5em}
    .picker_wrapper.popup,.picker_wrapper.popup .picker_arrow::before,.picker_wrapper.popup .picker_arrow::after{background:#f2f2f2;box-shadow:0 0 10px 1px rgba(0,0,0,0.4)}
    .picker_wrapper.popup .picker_arrow{width:3em;height:3em;margin:0}
    .picker_wrapper.popup .picker_arrow::before,.picker_wrapper.popup .picker_arrow::after{content:"";display:block;position:absolute;top:0;left:0;z-index:-99}
    .picker_wrapper.popup .picker_arrow::before{width:100%;height:100%;-webkit-transform:skew(45deg);transform:skew(45deg);-webkit-transform-origin:0 100%;transform-origin:0 100%}
    .picker_wrapper.popup .picker_arrow::after{width:150%;height:150%;box-shadow:none}
    .popup.popup_top{bottom:100%;left:0}
    .popup.popup_top .picker_arrow{bottom:0;left:0;-webkit-transform:rotate(-90deg);transform:rotate(-90deg)}
    .popup.popup_bottom{top:100%;left:0}
    .popup.popup_bottom .picker_arrow{top:0;left:0;-webkit-transform:rotate(90deg) scale(1, -1);transform:rotate(90deg) scale(1, -1)}
    .popup.popup_left{top:0;right:100%}
    .popup.popup_left .picker_arrow{top:0;right:0;-webkit-transform:scale(-1, 1);transform:scale(-1, 1)}
    .popup.popup_right{top:0;left:100%}
    .popup.popup_right .picker_arrow{top:0;left:0}
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
                this.transparency = this.layer.metadata.transparency?this.layer.metadata.transparency:0;
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
    _renderVisibleLayerInfo() {
        if (this.layervisible) {
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
                <div class="fade${this.legendclipped?'':' hide'}"></div>
                <div id="lishowmore" @click="${()=>this._togglelegendclipped()}">Toon ${this.legendclipped?'meer':'minder'}...</div>
            `
        }
        return '';
    }
    updated() {
        requestAnimationFrame(()=>{
        //setTimeout(()=>{
                let legendPanel = this.shadowRoot.querySelector('map-legend-panel');            
                if (legendPanel) {
                    this.legendclipper = legendPanel.offsetHeight > 220;
                    if (!this.legendclipper) {
                        this.legendclipped = false;
                    } else {
                        this.legendclipped = this.layer.metadata.hasOwnProperty('legendclipped')?this.layer.metadata.legendclipped:true;
                    }
                }
            }//,1000
        )
    }
    _buttonClick(event) {
        let button = this.shadowRoot.querySelector('#licontainer');
        let picker = new Picker({parent:document.body, popup:'top'});
        picker.openHandler();
    }
    _togglelegendclipped() {
        this.legendclipped = !this.legendclipped;
        this.layer.metadata.legendclipped = this.legendclipped;        
    }
    _renderShowInfo() {
        if (this.layer.metadata && this.layer.metadata.abstract && this.layer.metadata.abstract.trim() !== "") {
            return html`
                <div class="iconbutton" @click="${()=>this.moreInfo=!this.moreInfo}"><span class="icon">${iconInformationCircle}</span> Meer informatie</div>
                <div class="moreinfo${this.moreInfo?'':' hide'}">${this.layer.metadata.abstract}</div>
            `
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