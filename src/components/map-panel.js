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
        .panel-wrapper {
          display: flex;
          pointer-events: auto;
          background-color: rgba(250,250,250,.87);
          box-shadow: 0 0 1px 1px rgba(204,204,204,.5);
          box-sizing: border-box;
          padding: 10px;
          width: 100%;
          min-height: 55px;
        }
        .panel-content {
          width: 100%;
          padding: 2px;
          background-color: white;
        }
    </style>
    <div class="panel-wrapper">
      <div class="panel-content">
        <slot></slot>
      </div>
    </div>`;
  }
}
customElements.define('map-panel', MapPanel);
