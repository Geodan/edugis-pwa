import {LitElement, html, css} from 'lit';
class ToolTip extends LitElement {
    static get styles() {
        return css`
        :host {
            display: inline-block;
        }
        div {
            position: absolute;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #505050;
            color: white;
            pointer-events: none;
            padding: 3px;
            border-radius: 3px;
            font-size: smaller;
            word-wrap: break-word;
            width: 150px;
            text-align: center;
        }
        `
    }
    static get properties() { 
        return { 
          active: {type: Boolean}
        }; 
    }
    constructor() {
        super();
        this.active = false;
        this._title = "";
        this._left = this._top =  0;
        this._right = null;
    }
    connectedCallback() {
        super.connectedCallback()
        window.addEventListener('showtooltip', this._showToolTip.bind(this));
        window.addEventListener('hidetooltip', this._hideToolTip.bind(this));
    }
    disconnectedCallback() {
        super.disconnectedCallback()
        window.removeEventListener('showtooltip', this._showToolTip.bind(this));
        window.addEventListener('hidetooltip', this._hideToolTip.bind(this));
    }
    render() {
        if (!this.active) {
            return html``;
        }
        return html`
        <div id="tooltip" 
            style="${this._left?`left: ${this._left}`:`right: ${this._right}`}px; top: ${this._top}px; height:${this._height}px;${this._style?` background-color:${this._style.backgroundColor};color:${this._style.color};`:''}">
            <span>${this._title}</span>
        </div>
        `
    }
    _showToolTip(e) {
        const clientRect = e.detail.rect;
        if (window.innerWidth - clientRect.right > clientRect.left) {
            // display on right side
            this._left = clientRect.right + 10;
            this._right = null;
        } else {
            // display on left side
            this._left = null;
            this._right = window.innerWidth - (clientRect.left - 10);
        }
        this._top = clientRect.top;
        this._height = clientRect.height;
        this._title = e.detail.title;
        this._style = e.detail.style;
        this.active = true;
        this.requestUpdate();
    }
    _hideToolTip(e) {
        this.active = false;
    }
}

customElements.define('tool-tip', ToolTip);