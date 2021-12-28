import {LitElement, html, css, svg} from 'lit-element';
class MapLegendLine extends LitElement {
    static get styles() {
        return css`
        :host {
            display: block;
        }
        .container {
            display: flex;
            align-items: center;
        }
        .label {
            padding-left: 2px;
        }`
    }
    static get properties() { 
        return { 
          items: {type: Array}
        }; 
    }
    constructor() {
        super();
        this.items = [];
    }
    connectedCallback() {
        super.connectedCallback()
        //addEventListener('keydown', this._handleKeydown);
    }
    disconnectedCallback() {
        super.disconnectedCallback()
        //window.removeEventListener('keydown', this._handleKeydown);
    }
    shouldUpdate(changedProp) {
        if (changedProp.has('items')) {
            // do something with sprop change
        }
        return true;
    }
    _lineItem(color, width, label) {
        return svg`<svg width="30" height="15">
        <line x1="0" y1="8" x2="30" y2="8" style="stroke:${color};stroke-width:${width};" />
        </svg>${html`<span class="label">${label}</span>`}`
    }
    render() {
        if (this.items.colorItems.length <= 1 && this.items.strokeWidthItems.length <= 1) {
            const color = this.items.colorItems.length ? this.items.colorItems[0].paintValue : '#000';
            const width = this.items.strokeWidthItems.length ? this.items.strokeWidthItems[0].paintValue : 1;
            const label = this.items.colorItems.length ? this.items.colorItems[0].attrName: 'untitled';
            const line = this._lineItem(color, width, label);
            return html`
            <div class="container">${line}</div>
            `
        }
        return html`<div class="container">not yet implemented</div>`
    }
    firstUpdated() {

    }
    updated() {

    }
}

customElements.define('map-legend-line', MapLegendLine);