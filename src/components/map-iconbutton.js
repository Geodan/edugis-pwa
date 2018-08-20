


import {LitElement, html} from '@polymer/lit-element';
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
  _shouldRender(props, changedProps, prevProps) {
    return this.visible;
  }
  _render({visible, icon, info}) {
    return html`<style>
        :host {
          
        }
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
    <div title$="${info}" class$="button ${visible ? '' : 'hidden'}">${icon}</div>`;
  }
  _didRender() {
    ;
  }
  _firstRendered() {
      /*
    */
  }
}
customElements.define('map-iconbutton', IconButton);
