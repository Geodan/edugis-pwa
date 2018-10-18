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
          display: inline-block;
          height: 30px;
          width: 30px;
          box-sizing: border-box;
          background-color: white;
          box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
          border-radius: 4px;
          text-align: center;
          user-select:none;
          cursor: pointer; /* Mouse pointer on hover */
          padding: 3px;
        }
        .button:hover {
          background-color: whitesmoke;
        }
        .hidden {
          display: none;
        }
    </style>
    <div title="${this.info}" class="button ${this.visible ? '' : 'hidden'}">${this.icon}</div>`;
  }
}
customElements.define('map-iconbutton', IconButton);
