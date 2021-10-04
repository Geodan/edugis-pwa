import {LitElement, html,svg} from 'lit-element';
/**
* @polymer
* @extends HTMLElement
*/
class IconButton extends LitElement {
  static get properties() { 
    return { 
      active: {type: Boolean},
      disabled: {type: Boolean},
      icon: {type: String},
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
          background-color: #87D1FF;
          fill: white;
          color: white;
        }
        .button.disabled:hover {
          background-color: white;
          color: rgb(160,160,160);
          fill: rgb(160,160,160);
        }
        .button.active:hover {
          background-color: #286CA0;
          fill: white;
          color: white;
        }
        .active {
          background-color: #2E7DBA;
          fill: white;
          color: white;
        }
        .disabled {
          background-color: white;
          fill: rgb(160,160,160);
          color: rgb(160,160,160);
        }
    </style>
    <div title="${this.info}" class="${`button${this.active ? ' active' : ''}${this.disabled?' disabled':''}`}">${this.icon}<slot></slot></div>`;
  }
}
customElements.define('map-iconbutton', IconButton);
