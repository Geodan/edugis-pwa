

import {LitElement, html} from '@polymer/lit-element';

class ButtonExpandable extends LitElement {
  static get properties() { 
    return { 
      open: Boolean,
      icon: String
    }; 
  }
  constructor() {
      super();
      this.open = false;
      this.icon = '';
  }
  _shouldRender(props, changedProps, prevProps) {
    return true;
  }
  _render({open, icon}) {
    return html`<style>
        :host {
            position: absolute;
            left: 20px;
            top: 20px;
        }
        ::slotted(*) {
          display: none;
        }
    </style><slot></slot><button class="mapbutton">${icon}</button>`
  }
  _didRender() {
    ;
  }
  _firstRendered() {
      /*
    */
  }
}
customElements.define('button-expandable', ButtonExpandable);