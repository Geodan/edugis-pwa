import {LitElement, html, css, svg} from 'lit-element';
class MapLegendFill extends LitElement {
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
          items: {type: Object}
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
    _fillItem(color, strokeColor, label) {
        return svg`
        <svg width="30" height="15">
          <rect width="30" height="15" style="fill:${color};stroke-width:1;stroke:${strokeColor}"/>
        </svg>${html`<span class="label">${label}</span>`}`;
        // <rect width="30" height="15" style="fill:${color};fill-opacity:${fillOpacity};stroke-width:1;stroke:${strokeColor}"/>
    }
    _eqSet(as, bs) {
        if (as.size !== bs.size) return false;
        for (var a of as) if (!bs.has(a)) return false;
        return true;
    }
    render() {
        const items = this.items;
        if (items.colorItems.length <= 1 && items.strokeColorItems.length <= 1) {
            const color = items.colorItems.length ? items.colorItems[0].paintValue : 'rgba(0,0,0,0)';
            const strokeColor = items.strokeColorItems.length ? items.strokeColorItems[0].paintValue : color;
            const label = items.colorItems.length ? items.colorItems[0].attrExpression ? `${items.colorItems[0].attrExpression} ${items.colorItems[0].attrName}` : items.colorItems[0].attrName: this.title;
            const fill = this._fillItem(color, strokeColor, label);
            return html`
            <div class="container">${fill}</div>
            `
        }
        let result = [];
        let usedStrokeValues = new Set();
        if (items.colorItems.length > 1) {
            result.push(html`<div class="title">${items.colorItems[0].attrName}</div>`);
            for (let i = 0; i < items.colorItems.length; i++) {
                const label = items.colorItems[i].attrValue;
                const strokeColors = items.strokeColorItems.filter(({attrValue})=>attrValue===label);
                const strokeColor = strokeColors.length === 1 ? strokeColors[0].paintValue: items.strokeColorItems.length === 1 ? items.strokeColorItems[0].paintValue : items.colorItems[i].paintValue;
                if (strokeColors.length === 1) {
                    usedStrokeValues.add(strokeColors[0].attrValue);
                }
                if (label) {
                    result.push(html`<div class="container">${this._fillItem(items.colorItems[i].paintValue,strokeColor,label)}</div>`)
                }
            }
        }
        const allStrokeValues = new Set(items.strokeColorItems.map(({attrValue})=>attrValue));
        if (!this._eqSet(allStrokeValues, usedStrokeValues) && items.strokeColorItems.length > 1) {
            result.push(html`<div class="title">${items.strokeColorItems[0].attrName}</div>`);
            for (let i = 0; i < items.strokeColorItems.length; i++) {
                let fillColor = items.colorItems.length === 1 ? items.colorItems[0].paintValue : '#fff';
                const label = items.strokeColorItems[i].attrValue;
                if (label) {
                    result.push(html`<div class="container">${this._fillItem(fillColor, items.strokeColorItems[i].paintValue,label)}</div>`)
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

customElements.define('map-legend-fill', MapLegendFill);