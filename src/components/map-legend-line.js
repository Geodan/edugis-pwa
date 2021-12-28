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
          title: {stype: String},
          items: {type: Array}
        }; 
    }
    constructor() {
        super();
        this.title = "untitled";
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
        const items = this.items;
        if (items.colorItems.length <= 1 && items.strokeWidthItems.length <= 1) {
            const color = items.colorItems.length ? items.colorItems[0].paintValue : '#000';
            const width = items.strokeWidthItems.length ? items.strokeWidthItems[0].paintValue : 1;
            const label = items.colorItems.length ? items.colorItems[0].attrExpression ? `${items.colorItems[0].attrExpression} ${items.colorItems[0].attrName}` : items.colorItems[0].attrName: 'untitled';
            const line = this._lineItem(color, width, label);
            return html`
            <div class="container">${line}</div>
            `
        }
        let result = []
        if (items.colorItems.length > 1) {
            const lineWidth = items.strokeWidthItems.length === 1 ? items.strokeWidthItems[0].paintValue : 1
            result.push(html`<div class="title">${items.colorItems[0].attrName}</div>`);
            for (let i = 0; i < items.colorItems.length; i++) {
                const label = items.colorItems.length ? items.colorItems[i].attrValue: null;
                if (label) {
                    result.push(html`<div class="container">${this._lineItem(items.colorItems[i].paintValue,width,label)}</div>`)
                }
            }
        }
        if (items.strokeWidthItems.length > 1) {
            let lineColor = items.colorItems.length === 1 ? items.colorItems[0].paintValue : '#aaa';
            result.push(html`<div class="title">${items.strokeWidthItems[0].attrName}</div>`);
            for (let i = 0; i < items.strokeWidthItems.length; i++) {
                const label = items.strokeWidthItems[i].attrValue;
                if (label) {
                    result.push(html`<div class="container">${this._lineItem(lineColor, items.strokeWidthItems[i].paintValue,label)}</div>`)
                }
            }
        }
        return result;
    }
    firstUpdated() {

    }
    updated() {

    }
}

customElements.define('map-legend-line', MapLegendLine);