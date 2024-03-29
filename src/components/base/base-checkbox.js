import {html, css, LitElement} from 'lit';

/**
* @polymer
* @extends HTMLElement
*/
class BaseCheckbox extends LitElement {
    static get properties() {
        return {
            checked: {type: Boolean},
            disabled: {type: Boolean},
            small: {type: Boolean},
            value: {type: String}
        }
    }
    static get styles() {
        return css`
            :host {
                display: inline-block;
            }
            .bccontainer {
                display: flex;
                align-items: center;
                position: relative;
                vertical-align: top;
                padding-left: 22px;
                margin-bottom: 0px;
                height: 1.3em;
                cursor: pointer;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
            .bccontainer.small {
                padding-left: 18px;
            }
            /* Hide the browser's default checkbox */
            .bccontainer input {
                position: absolute;
                opacity: 0;
                cursor: pointer;
                height: 0;
                width: 0;
            }
            /* Create a custom checkbox */
            .checkmark {
                position: absolute;
                left: 0;
                height: 20px;
                width: 20px;
                border-radius: 4px;
                border: 1px solid lightgray
            }
            .small .checkmark {
                height: 15px;
                width: 15px;
            }
            /* On mouse-over, add a grey background color */
            .bccontainer:hover input ~ .checkmark {
              background-color: #ccc;
            }
            .bccontainer.checked:hover input ~ .checkmark {
                background-color: var(--theme-background-color, #2e7dba);
                color: var(--theme-color, white);
            }
            
            /* When the checkbox is checked, add a blue background */
            .bccontainer.checked .checkmark {
              background-color: var(--theme-hover-background-color, #2196F3);
              color: var(--theme-color, white);
              border-color: var(--theme-color, white);
            }
            .bccontainer.disabled .checkmark {
                background-color: lightgray;
                cursor: auto;
            }
            .bccontainer.disabled {
                color: gray;
                cursor: auto;
            }
            /* Create the checkmark/indicator (hidden when not checked) */
            .checkmark:after {
              content: "";
              position: absolute;
              display: none;
            }
            /* Show the checkmark when checked */
            .bccontainer.checked .checkmark:after {
                display: block;
            }
            /* Style the checkmark/indicator */
            .bccontainer .checkmark:after {
              left: 7px;
              top: 2px;
              width: 5px;
              height: 10px;
              border: solid var(--theme-color, white);
              border-width: 0 2px 2px 0;
              -webkit-transform: rotate(45deg);
              -ms-transform: rotate(45deg);
              transform: rotate(45deg);
            }
            .bccontainer.small .checkmark:after {
                left: 5px;
                width: 3px;
                height: 8px;
            }
        `
    }
    constructor() {
        super();
        this.checked = false;
        this.disabled = false;
        this.value = undefined;
    }
    render() {
        return html`
        <label class="bccontainer${this.disabled?' disabled':''}${this.small?' small':''}${this.checked?' checked':''}"><slot></slot>
            <input type="checkbox" ?checked="${this.checked}" ?disabled="${this.disabled}" ?.value="${this.value}" @change="${(e)=>this._handleChange(e)}">
            <span class="checkmark"></span>
        </label>
        `
    }
    _handleChange(event) {
        this.checked = event.target.checked;
        this.dispatchEvent(new CustomEvent('change', {
            bubbles: true,
            composed: true
        }));
    }
}

window.customElements.define('base-checkbox', BaseCheckbox);