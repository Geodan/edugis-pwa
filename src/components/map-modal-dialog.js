import {LitElement, html,css} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js'
import {marked} from "marked";
import DOMPurify from 'dompurify';

/**
* @polymer
* @extends HTMLElement
*/
export class MapModalDialog extends LitElement {
  static get properties() { 
    return { 
      active: {type: Boolean},
      markdown: {type: String}
    }; 
  }
  static get styles() {
    return css`
        #overlay {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(204,204,204,0.6);
            z-index: 3; /* mapbox-gl uses z-index 2 for tools */
        }
        #window {
          display: flex;
          flex-direction: column;
          border: 1px solid lightgray;
          box-shadow: 4px 4px 9px 0px rgba(168,168,168,1);
          border-radius: 4px;
          max-width: 50%;
          min-height: 120px;
          max-height: 80%;
          background-color: white;  
        }
        #header {
          display: block;
          height: 2em;
          border-bottom: 1px solid whitesmoke;
        }
        #closebutton {
          float: right;
          padding: 2px 10px;
          margin: 2px;
          cursor: pointer;
          font-weight: bold;
        }
        #closebutton:hover {
          background-color: lightgray;
        }
        #content {
          overflow: auto;
          padding: 5px;
        }
      `
  }
  constructor() {
      super();
      this.active = false;
      this.markdown = "";
  }
  shouldUpdate(changedProps) {
    if (changedProps.has('markdown')) {
      if (this.markdown && this.markdown !== '') {
        this.active = true;
      }
    }
    return true;
  }
  render() {
    if (!this.active) {
      return html``;
    }
    const parsed = DOMPurify.sanitize(marked.parse(this.markdown)).replace(/<a /g, '<a target="_blank" rel="nofollow" ');
    return html`
    <div id="overlay" @click="${e=>this._close(e)}">
      <div id="window" @click="${e=>e.stopPropagation()}">
        <div id="header"><div @click="${e=>this._close(e)}" id="closebutton">x</div></div>
        <div id="content">${unsafeHTML(parsed)}</div>
      </div>
    </div>`
  }
  _close(event) {
    console.log(event.target);
    console.log(event.currentTarget);
    this.active = false;
    this.markdown = '';
  }
}
customElements.define('map-modal-dialog', MapModalDialog);
