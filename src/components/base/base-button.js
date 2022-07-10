import {html, css, LitElement} from 'lit';

/**
* @polymer
* @extends HTMLElement
*/
class BaseButton extends LitElement {
    static get properties() {
        return {
            disabled: {type: Boolean},
            small: {type: Boolean},
            checked: {type: Boolean},
            isradio: {type: Boolean},
            rightborder: {type: Boolean},
            value: {type: String}
        }
    }
    static get styles() {
        return css`
            :host {
                display: inline-block;
            }
            button {
                background-color: #2E7DBA;
                border: none;
                outline: none;
                color: white;
                padding: 10px 32px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                cursor: pointer;
                border-radius: 5px;
                font-size: 14px;
                margin: 2px;
            }
            button:focus {
                opacity: 0.9;
            }
            button[isradio] {
                margin: 0;
                border-radius: 0;
                height: 100%;
            }
            button[small] {
                padding: 4px 8px;
                font-size: smaller;
            }
            button::-moz-focus-inner {
                border: 0;
            }
            button[disabled] {
                color: #9E9E9E;
                background-color: #E3E2E3;
                cursor: auto;
            }
            button:not([disabled]):hover {
                opacity: 0.7;
            }
            button:not([disabled]):active {
                background-color: white;
                color: #2E7DBA;
                opacity: 1;
            }
            button:not([disabled]):not([isradio]):active {
                border: 1px solid #2E7DBA;
                padding: 9px 31px;
            }
            button[isradio]:not([checked]):not([disabled]) {
                background-color: white;
                color: #2E7DBA;
            }
            button[isradio]:not([checked]):not([disabled]):active {
                background-color: #2E7DBA;
                color: white;                
            }
            button[isradio][rightborder] {
                border-right: 1px solid #2E7DBA;
            }
            button[small]:not([disabled]):not([isradio]):active {
                padding: 4px 7px;
            }
            ::slotted(svg) {
                width: 1em;
                height: 1em;
                margin-bottom:-2px;
                fill: white;
            }
        `
    }
    constructor() {
        super();
        this.disabled = false;
        this.checked = false;
        this.small = false;
        this.value = null;
        this.isradio = false;
        this.rightborder = false;
    }
    render() {
        return html`
        <button @click="${(e)=>this._click(e)}" ?disabled="${this.disabled}" ?checked="${this.checked}" ?small="${this.small}" ?isradio="${this.isradio}" ?rightborder="${this.rightborder}" value="${this.value}"><slot>Untitled</slot></button>
        `
    }
    firstUpdated() {
        this.addEventListener('click', this._checkClick)
    }
    _click(event) {
        if (event.target.tagName === 'SLOT') {
            this.value = event.target.parentElement.value;
        } else {
            if (event.target.tagName === 'BUTTON') {
                this.value = event.target.value;
            } else {
                event.stopPropagation();
            }
        }
    }
    _checkClick(event) {
        if (this.disabled) {
            event.stopPropagation();
        }
    }
}

window.customElements.define('base-button', BaseButton);