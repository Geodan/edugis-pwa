import {html, css, LitElement} from 'lit-element';

import "../../base/base-arrow.js";
import "./map-layer.js";

/**
* @polymer
* @extends HTMLElement
*/
class MapLayerSet extends LitElement {
    static get properties() {
        return {
            layerlist: {type: Array},
            nolayer: {type: String}, 
            open: {type: Boolean},
            userreorder: {type: Boolean}
        }
    }
    static get styles() {
        return css`
            :host {
                display: block;
            }
            #title {
                position: relative;
                height: 58px;
                line-height: 58px;
                cursor: pointer;
            }
            base-arrow {
                position: absolute;
                right: 0px;
                top: calc(50% - 8px);
            }
            #set {
                position: relative;
                transition: height .5s ease-in-out;
            }
            .closed {
                height: 0;
                padding: 0;
                overflow: hidden;
            }
        `
    }
    constructor() {
        super();
        this.layerlist = [];
        this.nolayer = null;
        this.userreorder = false;
        this.open = false;

        this.itemcontainer = null;
        this.itemscroller = null;
    }
    shouldUpdate(changedProperties) {
        if (changedProperties.has('layerlist')) {
            this._updateContainers();
        }
        return true;
    }
    render() {
        return html`
        <div id="title" @click="${()=>this._toggleArrow()}"><base-arrow ?open="${this.open}" @change="${e=>this._openChange(e)}"></base-arrow><slot>Layer set title</slot></div>
        <div id="set" class="${this.open?'':'closed'}">${this._renderLayerList()}</div>
        `
    }
    firstUpdated() {
        this._updateContainers();
    }
    _toggleArrow() {
        let arrow = this.shadowRoot.querySelector('base-arrow');
        if (arrow) {
            arrow.open = !arrow.open;
            this._openChange();
        }
    }
    _updateContainers() {
        if (this.userreorder && this.layerlist.length > 1) {
            this.itemcontainer = this.shadowRoot.querySelector('#set');
            this.itemscroller = this.itemcontainer;
            this.shadowRoot.querySelectorAll('map-layer').forEach(mapLayer=>{
                mapLayer.itemcontainer = this.itemcontainer;
                mapLayer.itemscroller = this.itemscroller;
            })
        } else {
            this.itemscroller = this.itemcontainer = null;
        }
    }
    _renderLayerList() {
        if (this.layerlist.length == 0) {
            return html`<map-layer .nolayer="${this.nolayer}"></map-layer>`;
        }
        return this.layerlist.map(layer=>{
            return html`<map-layer .layer="${layer}" .itemcontainer="${this.itemcontainer}" .itemscroller="${this.itemscroller}"></map-layer>`
        });
    }
    _openChange(event) {
        const setContainer = this.shadowRoot.querySelector('#set');
        if (setContainer.classList.contains('closed')) {
            // open the set
            setContainer.style.height = 0; 
            setTimeout(()=>setContainer.style.height=setContainer.scrollHeight + 'px', 100);
            setTimeout(()=>{
                setContainer.classList.remove('closed');
                setContainer.style.height = null;
            }, 600);
        } else {
            // close the set
            setContainer.style.height = setContainer.scrollHeight + 'px';
            setContainer.style.overflow = 'hidden';
            setTimeout(()=>setContainer.style.height = 0, 100);
            setTimeout(()=>{
                setContainer.classList.add('closed');
                setContainer.style.height = null;
                setContainer.style.overflow = null;
            }, 600);
        }
    }
}

window.customElements.define('map-layer-set', MapLayerSet);