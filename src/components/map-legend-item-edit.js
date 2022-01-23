import {LitElement, html, css} from 'lit-element';
import './color-picker';

class MapLegendItemEdit extends LitElement {
    static get styles() {
        return css`
        :host {
            display: block;
        }
        .panel {
            margin-left: 2px;
            background-color: whitesmoke;
            border-radius: 3px;
        }
        .wrapper {
            display: flex;
            flex-direction: row;
            align-items: stretch;
            width: 100%;
        }
        .wrapper .label {
            margin-top: auto;
            margin-bottom: auto;
        }
        .wrapper .right {
            flex: 1;
        }
        #fillpicker {
            display: inline-block;
            width:  15px;
            height: 10px;
            border: 1px solid gray;
            cursor: pointer;
      }
      
      `
    }
    static get properties() { 
        return { 
          legendItemType: {type: String}, // 'fill', 'line', 'circle', ...
          color: {type: String},
          lineWidth: {type: Number},
          lineColor: {Stype: String},
          radius: {type: Number},
          visible: {type: Boolean}
        }; 
    }
    constructor() {
        super();
        this.visible = false;
        this.legendItemType = undefined;
        this.color = undefined;
        this.lineWidth = undefined;
        this.lineColor = undefined;
        this.radius = undefined;
    }
    shouldUpdate(changedProp) {
        return true;
    }
    render() {
        return html`<slot @click="${this._click}"></slot>
            ${this.visible?this._renderLegendEditor():""}`
    }
    firstUpdated() {

    }
    updated() {

    }
    _click(e) {
        this.visible = !this.visible;
    }
    _renderLegendEditor() {
        let color = this.color;
        switch(this.legendItemType) {
            case 'fill':
                return html`
                <div class="panel">
                        <label>Aanpassen: </label>
                        <color-picker .color=${this.color} @change=${e=>this._colorChange(e)}>
                            <div id="fillpicker" title="kleur" style="background-color:${color}"></div>
                        </color-picker>
                        <color-picker .color=${this.color} @change=${e=>this._lineColorChange(e)}>
                            <svg width="20" height="10">
                                <title>lijnkleur</title>
                                <line x1="0" y1="5" x2="20" y2="5" fill="none" stroke="${this.lineColor?this.lineColor:'gray'}" />
                            </svg>
                        </color-picker>
                </div>`
            case 'line': 
                return html`
                <div class="panel">${this.width !== undefined?html`<div class="wrapper">
                        <div class="label">dikte: </div><input class="right" type="range" min="0" max="10" step="0.1" value="${this.width}" @input=${this._widthChanged}> </div>`:""}
                    <div id="color" class="wrapper"><label>kleur aanpassen: </label><div id="picker" style="background-color:${color}"></div></div>
                </div>`
            default:
                return html`Legend item editor for '${this.legendItemType}' not implemented`;
        }
    }
    _colorChange(event) {
        this.dispatchEvent(new CustomEvent('change', {
            detail: {
                color: event.detail.color
            }
        }));
    }
}

customElements.define('map-legend-item-edit', MapLegendItemEdit);