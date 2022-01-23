import {LitElement, html, css, svg} from 'lit-element';
import './map-legend-item-edit';
/* import {hcl, lab} from '../utils/colorspace';
imort Color from '../utils/color'; */
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
        .stretch {
            display: flex;
            justify-content: space-between;
        }
        .label {
            padding-left: 2px;
        }`
    }
    static get properties() { 
        return { 
          title: {stype: String},
          items: {type: Object},
          layerid: {type: String}
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
        // if (changedProp.has('items')) {}
        return true;
    }
    _fillItem(color, strokeColor, label) {
        return svg`
        <svg width="30" height="15">
          <rect width="30" height="15" style="fill:${color};stroke-width:1;stroke:${strokeColor}"/>
        </svg>${html`<span class="label">${label}</span>`}`;
        // <rect width="30" height="15" style="fill:${color};fill-opacity:${fillOpacity};stroke-width:1;stroke:${strokeColor}"/>
    }
    _gradientItem(gradients, label, base) {
        /*
        const startColor = Color.parse(items.colorItems[i].paintValue);
        const endColor = Color.parse(items.colorItems[i+1].paintValue);
        const startforward = hcl.forward(startColor);
        const endforward = hcl.forward(endColor);
        // get colors at start (0) and end (1)
        let s1 = hcl.reverse(hcl.interpolate(startforward, endforward, 0));
        let s2 = hcl.reverse(hcl.interpolate(startforward, endforward, 1));
        gradients.push({
            startLabel: items.colorItems[i].attrName, 
            startValue: items.colorItems[i].attrValue, 
            startColor: s1.toString(), 
            endLabel: items.colorItems[i+1].attrName, 
            endValue: items.colorItems[i+1].attrValue, 
            endColor: s2.toString()}); 
        */
        return svg`
        ${html`<div class="label">${label}</div>`}
        <svg width="150" height="15">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                ${gradients.map(({color}, index, arr)=>
                    svg`
                    <stop offset="${(index/arr.length)*100}%" style="stop-color:${color};stop-opacity:1" />
                `)}
                </linearGradient>
            </defs>
          <rect width="150" height="15" style="fill:url(#grad);"/>
        </svg>
        ${html`<div class="stretch"><span>${parseFloat(gradients[0].label)}</span></span>${gradients[gradients.length -1].label}</span></div>`}`;
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
            const lineColor = items.strokeColorItems.length ? items.strokeColorItems[0].paintValue : undefined;
            const strokeColor = items.strokeColorItems.length ? items.strokeColorItems[0].paintValue : color;
            const label = items.colorItems.length ? items.colorItems[0].attrExpression ? `${items.colorItems[0].attrExpression} ${items.colorItems[0].attrName}` : items.colorItems[0].attrName: this.title;
            const fill = this._fillItem(color, strokeColor, label);
            return html`
            <map-legend-item-edit @change="${this._fillColorChanged}" legendItemType="fill" .color=${color} .lineColor=${lineColor}><div class="container">${fill}</div></map-legend-item-edit>
            `
        }
        if (items.colorItems[0].attrExpression && items.colorItems[0].attrExpression.startsWith('interpolate-')) {
            let gradients = [];
            for (let i = 0; i < items.colorItems.length; i++) {
                gradients.push({label: items.colorItems[i].attrValue, color: items.colorItems[i].paintValue});
            }
            const label = items.colorItems[0].attrName;
            const base = items.colorItems[0].attrExpression.split(',')[2];
            const fill = this._gradientItem(gradients, label, base);
            return html`
                <div>${fill}</div>
                `
        }
        let result = []
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
    _fillColorChanged(event) {
        this.items.colorItems[0].paintValue = event.detail.color;
        const itemsCopy = {
            colorItems: this.items.colorItems,
            radiusItems: this.items.radiusItems,
            strokeColorItems: this.items.strokeColorItems,
            strokeWidthItems: this.strokeWidthItems
        }
        this.items = itemsCopy;
        this.dispatchEvent(new CustomEvent('change', {
            detail: {
                layerid: this.layerid,
                color: event.detail.color
            }
        }))
    }
    firstUpdated() {

    }
    updated() {

    }
}

customElements.define('map-legend-fill', MapLegendFill);