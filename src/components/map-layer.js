


import {LitElement, html} from '@polymer/lit-element';
class MapLayer extends LitElement {
  static get properties() { 
    return { 
      layerInfo: Object,
      webmap: Object
    }; 
  }
  constructor() {
      super();
      this.layerinfo = null;
      this.webmap = null;
  }
  _shouldRender(props, changedProps, prevProps) {
      return (props.webmap ? true : false);
  }
  _render({layerInfo, webmap}) {
    return html`<style>
        :host {
            position: absolute;
            display: block;
            right: 10px;
            bottom: 40px;
            background-color: white;
            box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
            border-radius: 4px;
        }
    </style><div>Layer</div>`
  }
  _didRender() {
    ;
  }
  _firstRendered() {
      /*
    */
  }
}

customElements.define('map-layer', MapLayer);
