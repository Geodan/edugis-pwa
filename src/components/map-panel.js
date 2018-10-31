import {LitElement, html} from '@polymer/lit-element';

/**
* @polymer
* @extends HTMLElement
*/
class MapPanel extends LitElement {
  static get properties() { 
    return { 
      visible: Boolean,
    }; 
  }
  constructor() {
      super();
      this.visible = false;      
  }
  render() {
    return html`<style>
        :host {
          margin-left: -384px;
          padding: 10px;
          pointer-events: auto;
          background-color: rgba(250,250,250,.87);
          box-shadow: 0 0 1px 1px rgba(204,204,204,.5);
          box-sizing: border-box;
        }
        .visible {
          margin-left: 0px;
          transition: margin 1s ease;
        }        
    </style>
    <div ?class="${this.visible}">
      <div>Hallo Hallo</div>
    </div>`;
  }
}
customElements.define('map-panel', MapPanel);
