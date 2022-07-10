import {LitElement, html} from 'lit';

/**
* @polymer
* @extends HTMLElement
*/
class MapPanel extends LitElement {
  static get properties() { 
    return { 
      active: Boolean,
    }; 
  }
  constructor() {
      super();
      this.active = false;
  }
  render() {
    if (!this.active) {
      return html``;
    }
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
          max-height: calc(100vh - 115px);
        }
        .panel-content {
          width: 100%;
          padding: 2px 8px 8px 8px;
          background-color: white;
          box-sizing: border-box;
          color: #555;
        }
    </style>
    <div class="panel-wrapper">
      <div class="panel-content" @dragover="${e=>e.preventDefault()}" @drop="${e=>e.preventDefault()}">
        <slot></slot>
      </div>
    </div>`;
  }
}
customElements.define('map-panel', MapPanel);
