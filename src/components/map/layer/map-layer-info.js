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
            moreInfo: {type: Boolean},
            showLayerConfig: {type: Boolean}
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
                width: 200px;
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
                max-height: 1500px;
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
    }
    shouldUpdate(changedProperties) {
        if (changedProperties.has('layer')) {
            this.moreInfo = false;
            this.showLayerConfig = false;
        }
        return true;
    }
    render() {
        return html`
        <div id="licontainer">
            <div id="litransparency"><span class="bold">Transparantie:</span> 0%
                <div class="lislidercontainer">
                    <base-slider></base-slider>
                </div>
            </div>
            <div id="lilegend">
                <div id="lilegendtitle" class="bold">Legenda:</div>
                <div id="moreinfo" class="shortened">
                    <map-legend-panel .maplayer="${this.layer}"></map-legend-panel>
                </div>
                <div class="fade"></div>
                <div id="lishowmore" @click="${()=>this._toggleShowMore()}">Toon meer...</div>
            </div>
            ${this._renderShowInfo()}
            ${this._renderSettings()}
            <div class="iconbutton" @click="${()=>this._removeLayer()}"><span class="icon">${iconDelete}</span> Verwijderen</div>
        </div>
        `
    }
    updated() {
        setTimeout(()=>{
            let legendPanel = this.shadowRoot.querySelector('map-legend-panel');
            let fader = this.shadowRoot.querySelector('.fade');
            let lishowmore = this.shadowRoot.querySelector('#lishowmore');
            if (legendPanel.offsetHeight < 200) {
                fader.style.display = 'none';
                lishowmore.style.display = 'none';
            } else {
                fader.style.display = null;
                lishowmore.style.display = null;
            }
        }, 1000);
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
        let lishowmore = this.shadowRoot.querySelector('#lishowmore');
        let fader = this.shadowRoot.querySelector('.fade');
        if (moreInfo.classList.contains("shortened")) {
            moreInfo.classList.remove("shortened");
            lishowmore.innerHTML = "Toon minder..."
            fader.classList.add('hide');
        } else {
            moreInfo.classList.add("shortened");
            lishowmore.innerHTML = "Toon meer...";
            fader.classList.remove('hide');
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
}

window.customElements.define('map-layer-info', MapLayerInfo);