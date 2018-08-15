

import {LitElement, html} from '@polymer/lit-element';

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
  _shouldRender(props, changedProps, prevProps) {
    return true;
  }
  _render({info, open, icon}) {
    return html`
    <style>
        :host {
           
        }/*
        ::slotted(*) {
          
        }*/
        .container {
          position: absolute;
          left: 10px;
          top: 10px;
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
          visibility: visible;
          height: 32px;
          width: 32px;
          background-color: DodgerBlue; /* Blue background */
          border: none; /* Remove borders */
          color: white;
          cursor: pointer; /* Mouse pointer on hover */
          padding: 1px;
          margin-right: 5px;
        }
        .expandable:hover {
          background-color: royalblue;
        }
        .hidden {
          visibility: hidden;
        }
    </style>
    <div class$="container${open? '' : ' hidden'}">
      <div class="header">
      <button class="expandable">${icon}</button>${info}
      </div>
      <div class="content">
        <slot></slot>
      </div>
    </div>
    `
  }
  _didRender() {
    ;
  }
  _firstRendered() {
      this.shadowRoot.querySelector('.expandable').addEventListener('click', ()=>this.open=!this.open);
  }
}
customElements.define('button-expandable', ButtonExpandable);