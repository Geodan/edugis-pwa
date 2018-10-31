import {LitElement, html} from '@polymer/lit-element';
/**
* @polymer
* @extends HTMLElement
*/
class IconButton extends LitElement {
  static get properties() { 
    return { 
      visible: Boolean,
      icon: String,
      info: String
    }; 
  }
  constructor() {
      super();
      this.visible = true;
      this.icon = "";
      this.info = "Button";
  }
  shouldUpdate(changedProps) {
    return this.visible;
  }
  render() {
    return html`<style>
        .button {
          opacity: 0.9;
          display: inline-block;
          height: 55px;
          width: 55px;
          color: rgb(51,51,51);
          fill: rgb(51,51,51);
          box-sizing: border-box;
          background-color: white;
          text-align: center;
          user-select:none;
          cursor: pointer; /* Mouse pointer on hover */
          padding: 15px;
        }
        .button:hover {
          background-color: rgb(204,0,0);
          fill: white;
          color: white;
        }
        .hidden {
          display: none;
        }
    </style>
    <div title="${this.info}" class="button ${this.visible ? '' : 'hidden'}">${this.icon}</div>`;
  }
}
customElements.define('map-iconbutton', IconButton);
