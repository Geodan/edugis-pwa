import {LitElement, html} from '@polymer/lit-element';
/**
* @polymer
* @extends HTMLElement
*/
class IconButton extends LitElement {
  static get properties() { 
    return { 
      active: Boolean,
      disabled: Boolean,
      icon: String,
      info: String
    }; 
  }
  constructor() {
      super();
      this.active = false;
      this.disabled = false;
      this.icon = "Bt";
      this.info = "Button";
  }
  render() {
    return html`<style>        
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
          background-color: gray;
          fill: white;
          color: white;
        }
        .button.disabled:hover {
          background-color: white;
          color: rgb(160,160,160);
          fill: rgb(160,160,160);
        }
        .button.active:hover {
          background-color: rgb(160,0,0);
          fill: white;
          color: white;
        }
        .active {
          background-color: rgb(204,0,0);
          fill: white;
          color: white;
        }
        .disabled {
          background-color: white;
          fill: rgb(160,160,160);
          color: rgb(160,160,160);
        }
    </style>
    <div title="${this.info}" class="${`button${this.active ? ' active' : ''}${this.disabled?' disabled':''}`}">${this.icon}</div>`;
  }
}
customElements.define('map-iconbutton', IconButton);
