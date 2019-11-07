import {html, css, LitElement} from 'lit-element';

/**
* @polymer
* @extends HTMLElement
*/
class MapLayerContainer extends LitElement {
    static get properties() {
        return {
            checked: {type: Boolean}
        }
    }
    static get styles() {
        return css`
            :host {
                display: inline-block;
                width: 400px;
            }
            .border {
                background-color: rgba(250,250,250,.87);
                padding: 10px;
                box-sizing: border-box;
            }
            #mlccontainer {
                background-color: white;
                font-size: 12px;
                color: #555;
                fill: #777;
                margin: 0;
                padding: 10px;
                pointer-events: auto;
                display: flex;
                flex-direction: column;
                max-height: calc(100vh - 175px);
                overflow: auto;
                margin-bottom: 5px;
            }
            #title {
                font-weight: bold;
                height: 58px;
                line-height: 58px;
                border-bottom: 1px solid #E3E2E3;
            }
            #layersets ::slotted(:not(:last-child)) {
                border-bottom: 1px solid #E3E2E3;
            }
        `
    }
    constructor() {
        super();
        this.checked = false;
    }
    render() {
        return html`
        <div class="border">
            <div id="mlccontainer">
                <div id="title"><slot name="title">Selected Map Layers</slot></div>
                <div id="layersets"><slot></slot></div>
            </div>
        </div>
        `
    }

}

window.customElements.define('map-layer-container', MapLayerContainer);