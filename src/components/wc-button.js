import {LitElement, css, html} from 'lit';

class WcButton extends LitElement {
    static get properties() {
        return {
            disabled: {type: Boolean},
            tabindex: {type: Number, reflect: true},
            compact: {type: Boolean}
        }
    }
    constructor() {
        super();
        this.disabled = false;
        this.tabindex = 0;
        this.compact = false;
    }
    shouldUpdate(changedProperties) {
        if (changedProperties.has('disabled')) {
            if (this.disabled) {
                this.tabindex = null;
            } else if (this.originalTabindex) {
                this.tabindex = 0;
            }
        }
        return true;
    }
    static get styles() {
        return css`
            :host {
                display: inline-block;
            }
            button {
                display: inline-block;
                height: 36px;
                width: 100%;
                margin-top: 2px;
                margin-bottom: 4px;
                user-select: none;
                text-align: center;
                font: inherit;
                border: 1px solid var(--theme-background-color, var(--dark-color, #2E7DBA));
                border-radius: 5px;
                color: var(--theme-color, var(--light-color, white));
                background-color: var(--theme-background-color, var(--dark-color, #2E7DBA));
                height: 100%;
                line-height: 36px;
                padding: 0 8px 0 9px;
                cursor: pointer;
                font-size: 14px;
            }
            button:hover:not([disabled]), button:focus:not([disabled]) {
                background-opacity: .8;
                opacity: 0.8;
                outline: none;
            }
            button:active:not([disabled]) {
                background-color: var(--light-color, white);
                color: var(--dark-color, #2E7DBA);
            }
            button[disabled] {
                background-opacity: .5;
                opacity: .5;
                cursor: not-allowed;
            }
            button.compact {
                height: 28px;
                line-height: 28px;
                padding: 0 8px 0 9px;
                font-size: 12px;
            }
        `
    }
    render() {
        return html`
        <button ?disabled="${this.disabled}" class="${this.compact?'compact':''}" @click="${e=>this._handleClick(e)}">
            <slot></slot>
        </button>
        `;
    }
    _handleClick(e) {
        //console.log('click');
    }
}

window.customElements.define('wc-button', WcButton); 