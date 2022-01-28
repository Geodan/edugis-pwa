import {LitElement, html, css, svg} from 'lit-element';
import "./map-legend-item-edit";
class MapLegendSymbol extends LitElement {
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
        }
        .icon {
            vertical-align: middle;
        }`
    }
    static get properties() { 
        return { 
          title: {stype: String},
          symbols: {type: Array},
          fontStyle: {type: String},
          layerid: {type: String}
        }; 
    }
    constructor() {
        super();
        this.title = "untitled";
        this.symbols = [];
        this.fontStyle = "";
        this.layerid = "";
    }
    render() {
        if (this.symbols && this.symbols.length) {
            const result = [];
            if (this.symbols.length > 1) {
                result.push(html`<div>${this.title}</div>`)
            }
            for (const [index,symbol] of this.symbols.entries()) {
                const label = this.symbols.length === 1 ? this.title : symbol.attributeValues.join(',');
                result.push(html`<map-legend-item-edit @change=${this._symbolChange} legendItemType="symbol" itemIndex=${index} fontStyle=${this.fontStyle}><div><img class="icon" src="${symbol.data}"><span style=${this.fontStyle}>${label}</span></div></map-legend-item-edit>`)
            }
            return result;
        } else {
            return(html`<map-legend-item-edit @change=${this._symbolChange} legendItemType="symbol" fontStyle=${this.fontStyle}><div><span style=${this.fontStyle}>${this.title}</span></div></map-legend-item-edit>`)
        }
    }
    firstUpdated() {

    }
    updated() {

    }
    _symbolChange(event) {
        const itemIndex = event.detail.itemIndex;
        const fontStyle = event.detail.style;
        this.fontStyle = fontStyle;
        this.dispatchEvent(new CustomEvent('change', {
            detail: {
                layerid: this.layerid,
                fontStyle: fontStyle,
                itemIndex: itemIndex
            }
        }));
    }
}

customElements.define('map-legend-symbol', MapLegendSymbol);