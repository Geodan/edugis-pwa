import {html, css, LitElement} from 'lit-element';
import "./base-button.js";

/**
* @polymer
* @extends HTMLElement
*/
class BaseButtonRadio extends LitElement {
    static get properties() {
        return {
            small: {type: Boolean}, 
            buttons: {type: Array},
            value: {type: String}
        }
    }
    static get styles() {
        return css`
            :host {
                display: inline-block;
            }
            .radiobutton {
                display: inline-flex;
                margin: 2px;
                border-radius: 5px;
                border: 1px solid #2E7DBA;
                overflow: hidden;
            }
            .hidden{
                display:none;
            }
        `
    }
    constructor() {
        super();
        this.small = false;
        //this.buttons = [{label:'label', checked: 'false', disabled: 'false', value:null}]
        this.buttons = null;
    }
    render() {
        if (!this.buttons) {
            return html`<div class="hidden"><slot></slot></div>`
        }
        return html`
        <div class="radiobutton">${this.buttons.map((button,index)=>html`<base-button @click="${(e)=>this._clicked(e)}" isradio ?rightborder="${index < this.buttons.length -1}" ?checked="${button.checked}" ?disabled="${button.disabled}" ?small="${this.small}" value="${button.value}">${button.label}</base-button>`)}</div>
        `
    }
    firstUpdated() {
        if (!this.buttons) {
            this.buttons = this.shadowRoot.querySelector('slot').assignedNodes()
                .filter(node=>node.tagName === 'BASE-BUTTON' || node.tagName === 'BUTTON')
                .map(node=>{
                    return {
                        checked: this._getBoolAttribute(node, 'checked'),
                        disabled: this._getBoolAttribute(node, 'disabled'),
                        value: node.getAttribute('value')!==null?node.getAttribute('value'):node.textContent,
                        label: node.textContent
                    };
                });
        }
        this.value = this.buttons.reduce((result, button)=>{
            if (button.checked) {
                return button.value ? button.value : button.label;
            }
            return result;
        }, null);
    }
    _getBoolAttribute(elem, name) {
        let result = elem.getAttribute(name);
        return (result !== null);
    }
    _clicked(event) {
        if (event.target.disabled) {
            event.stopPropagation();
            return;
        }
        let buttonvalue = event.target.value;
        this.buttons = this.buttons.map(button=>{
            let newButton = Object.assign({}, button);
            newButton.checked = (button.value === buttonvalue);
            return newButton;
        });
        if (this.value !== buttonvalue) {
            this.value = buttonvalue;
            this.dispatchEvent(new CustomEvent('change', {
                bubbles: true,
                composed: true
            }))
        }
    }
}

window.customElements.define('base-button-radio', BaseButtonRadio);