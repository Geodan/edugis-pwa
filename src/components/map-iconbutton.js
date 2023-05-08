import {LitElement, html,svg,css} from 'lit';
/**
* @polymer
* @extends HTMLElement
*/
class IconButton extends LitElement {
  static get styles() {
    return css`
    .button {
      opacity: 0.9;
      display: inline-block;
      height: 100%;
      width: 100%;
      color: rgb(51,51,51);
      fill: rgb(51,51,51);
      box-sizing: border-box;
      background-color: white;
      text-align: center;
      user-select:none;
      cursor: pointer; /* Mouse pointer on hover */
    }
    .button:hover {
      background-color: var(--theme-hover-background-color, #3982b9);
      fill: white;
      color: white;
    }
    .button.disabled:hover {
      background-color: white;
      color: rgb(160,160,160);
      fill: rgb(160,160,160);
    }
    .button.active:hover {
      background-color: var(--theme-active-background-color, #286CA0);
      fill: white;
      color: white;
    }
    .active {
      background-color: var(--theme-background-color, #2e7dba);
      fill: white;
      color: white;
    }
    .disabled {
      background-color: white;
      fill: rgb(160,160,160);
      color: rgb(160,160,160);
    }`;
  }
  static get properties() { 
    return { 
      active: {type: Boolean},
      disabled: {type: Boolean},
      icon: {attribute: false},
      info: {type: String}
    }; 
  }
  constructor() {
      super();
      this.active = false;
      this.disabled = false;
      this.icon = svg`<svg height="24" width="60" viewbox="0 0 60 24"><style>.normal{ font: bold 18px sans-serif;}</style><text x="4" y="24" class="normal">icon?</text></svg>`;
      this.info = "Button";
  }
  render() {
    return html`
    <div 
      class="${`button${this.active ? ' active' : ''}${this.disabled?' disabled':''}`}"
      @mouseover="${this._mouseOver}"
      @mouseout="${this._mouseOut}"
      @click="${this._mouseOut}">${this.icon}<slot></slot></div>`;
  }
  updated(changedProperties) {
    if (changedProperties.has('active') && !this.active) {
      this._mouseOut();
    }
  }
  _mouseOver() {
    if (this.active) {
      return;
    }
    const buttonDiv = this.shadowRoot.querySelector('div');
    const rect = buttonDiv.getBoundingClientRect();
    const style = getComputedStyle(buttonDiv);
    this.dispatchEvent(new CustomEvent('showtooltip', {detail: {title: this.info, rect: rect, style: style}, bubbles: true, composed: true}));
  }
  _mouseOut() {
    this.dispatchEvent(new CustomEvent('hidetooltip', {bubbles: true, composed: true}));
  }
}
customElements.define('map-iconbutton', IconButton);
