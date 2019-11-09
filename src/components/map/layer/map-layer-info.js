import {html, css, LitElement} from 'lit-element';
import '../../base/base-slider.js';
import '../../map-legend-panel.js';
import './map-layer-config.js';
import {iconInformationCircle, iconCog, iconDelete} from "./map-layer-icons.js";

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
            showmore: {type: Boolean},
            showingmore: {type: Boolean}
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
            #moreinfo {
                max-height: 3000px;
                overflow: hidden;
                transition: max-height .8s ease-in-out;
            }
            #moreinfo.shortened {
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
        `
    }
    constructor() {
        super();
        this.layer = null;
        this.open = false;
        this.moreInfo = false;
        this.showLayerConfig = false;
        this.transparency = 0;
        this.showmore = false;
        this.showingmore = false;
    }
    shouldUpdate(changedProperties) {
        if (changedProperties.has('layer')) {
            this.moreInfo = false;
            this.showLayerConfig = false;
            this.transparency = this.layer.metadata.transparency?this.layer.metadata.transparency:0;
        }
        return true;
    }
    render() {
        return html`
        <div id="licontainer">
            ${this._renderVisibleLayerInfo()}
            <div class="iconbutton" @click="${()=>this._removeLayer()}"><span class="icon">${iconDelete}</span> Verwijderen</div>
        </div>
        `
    }
    _renderShowMore() {
        if (this.showmore) {
            return html`
                <div class="fade${this.showingmore?' hide':''}"></div>
                <div id="lishowmore" @click="${()=>this._toggleShowMore()}">Toon ${this.showingmore?'minder':'meer'}...</div>
            `
        }
        return '';
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
                <div id="moreinfo" class="shortened">
                    <map-legend-panel .maplayer="${this.layer}" transparency="${this.transparency}"></map-legend-panel>
                </div>
                ${this._renderShowMore()}
            </div>
            ${this._renderShowInfo()}
            ${this._renderSettings()}
            `
        }
        return ``;
    }
    updated() {
        requestAnimationFrame(()=>{
                let legendPanel = this.shadowRoot.querySelector('map-legend-panel');            
                if (legendPanel) {
                    this.showmore = legendPanel.offsetHeight > 220;
                }
            }
        )
    }
    _renderShowInfo() {
        if (this.layer.metadata && this.layer.metadata.abstract && this.layer.metadata.abstract.trim() !== "") {
            return html`
                <div class="iconbutton" @click="${()=>this.moreInfo=!this.moreInfo}"><span class="icon">${iconInformationCircle}</span> Meer informatie</div>
                <div class="moreinfo${this.moreInfo?'':' hide'}">${this.layer.metadata.abstract}</div>
            `
         }
    }
    _renderSettings(){
        if (this.layer.type === 'fill' || this.layer.type === 'line' || this.layer.type === 'circle') {
            return html`
                <div class="iconbutton" @click="${()=>this.showLayerConfig=!this.showLayerConfig}"><span class="icon">${iconCog}</span> Instellingen</div>
                <map-layer-config class="${this.showLayerConfig?'':"hide"}" .layer="${this.layer}"></map-layer-config>
            `
        }
        return '';
    }
    _toggleShowMore() {
        let moreInfo = this.shadowRoot.querySelector('#moreinfo');
        this.showingmore = !this.showingmore;
        if (this.showingmore) {
            moreInfo.classList.remove("shortened");
        } else {
            moreInfo.classList.add("shortened");
        }
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