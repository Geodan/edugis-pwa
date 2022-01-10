import {LitElement, html, css, svg} from 'lit-element';
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
          fontStyle: {type: String}
        }; 
    }
    constructor() {
        super();
        this.title = "untitled";
        this.symbols = [];
        this.fontStyle = "font-size:12";
    }
    render() {
        if (this.symbols && this.symbols.length) {
            const result = [];
            if (this.symbols.length > 1) {
                result.push(html`<div>${this.title}</div>`)
            }
            for (const symbol of this.symbols) {
                const label = this.symbols.length === 1 ? this.title : symbol.attributeValues.join(',');
                result.push(html`<div><img class="icon" src="${symbol.data}"><span style=${this.fontStyle}>${label}</span></div>`)
            }
            return result;
        } else {
            return(html`<div><span style=${this.fontStyle}>${this.title}</span></div>`)
        }
    }
    firstUpdated() {

    }
    updated() {

    }
}

customElements.define('map-legend-symbol', MapLegendSymbol);