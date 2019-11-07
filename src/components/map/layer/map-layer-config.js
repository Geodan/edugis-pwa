import {html, css, LitElement} from 'lit-element';
import './map-layer-config-legend.js';
/**
* @polymer
* @extends HTMLElement
*/
class MapLayerConfig extends LitElement {
    static get properties() {
        return {
            checked: {type: Boolean}
        }
    }
    static get styles() {
        return css`
            :host {
                display: inline-block;
            }
        `
    }
    constructor() {
        super();
        this.checked = false;
    }
    render() {
        return html`
        <map-layer-config-legend></map-layer-config-legend>
        `
    }

}

window.customElements.define('map-layer-config', MapLayerConfig);