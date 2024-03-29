

import {LitElement, html} from 'lit';
/**
* @polymer
* @extends HTMLElement
*/
class ButtonExpandable extends LitElement {
  static get properties() { 
    return {
      info: String,
      open: Boolean,
      icon: String
    }; 
  }
  constructor() {
      super();
      this.open = false;
      this.icon = '';
      this.info = "default title";
  }
  render() {
    return html`
    <style>
        .container {
          position: absolute;
          left: 10px;
          top: 60px;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          max-height: 400px;
          min-height: 200px;
          background-color: white;
        }
        .header {
          box-sizing: border-box;
          height: 40px;
          padding-left: 5px;
          padding-top: 5px;
          font-size: 1.17em;
          font-weight: bold;
        }
        .content {
          max-height: 360px;
          overflow: auto;
          padding-left: 5px;
          padding-right: 5px;
        }
        .expandable {
          display: inline-block;
          visibility: visible;
          height: 30px;
          width: 30px;
          box-sizing: border-box;
          background-color: white;
          box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
          border-radius: 4px;
          color: white;
          cursor: pointer; /* Mouse pointer on hover */
          padding: 3px;
          margin-right: 5px;
        }
        .expandable:hover {
          background-color: whitesmoke;
        }
        .hidden {
          visibility: hidden;
        }
    </style>
    <div class="container${this.open? '' : ' hidden'}">
      <div class="header">
      <div class="expandable" title="${this.info}">${this.icon}</div>${this.info}
      </div>
      <div class="content">
        <slot></slot>
      </div>
    </div>
    `
  }
  firstUpdated() {
      this.shadowRoot.querySelector('.expandable').addEventListener('click', ()=>this.open=!this.open);
  }
}
customElements.define('button-expandable', ButtonExpandable);