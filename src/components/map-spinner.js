
import {spinnerIcon} from './my-icons';

import {LitElement, html} from '@polymer/lit-element';
class MapSpinner extends LitElement {
  static get properties() { 
    return { 
      visible: Boolean,
      webmap: Object
    }; 
  }
  constructor() {
      super();
      this.delay = false;
      this.visible = false;
      this.webmap = null;
  }
  showSpinner() {
    // prevent short-duration spinners
    this.delay = true;
    setTimeout(()=>
      {
        if (this.delay) {
          this.visible = true;
        }
      }, 300)
  }
  hideSpinner() {
    if(this.webmap.loaded()) {
        this.delay = false;
        this.visible = false;
    }
  }
  registerMapEvents(prevMap, newMap)
  {
    const showSpinner = this.showSpinner.bind(this);
    const hideSpinner = this.hideSpinner.bind(this);
    if (prevMap) {
        prevMap.off("dataloading", showSpinner);
        prevMap.off("render", hideSpinner);
    }
    if (newMap) {
        newMap.on("dataloading", showSpinner);
        newMap.on("render", hideSpinner);
    }
  }
  _shouldRender(props, changedProps, prevProps) {
      if (prevProps.webmap !== changedProps.webmap) {
        this.registerMapEvents(prevProps.webmap, changedProps.webmap);
      }
      return (props.webmap ? true : false);
  }
  _render({webmap, visible}) {
    return html`<style>
        :host {
          z-index: 100;
          position: absolute;
          margin-left: auto;
          margin-right: auto;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
        .hidden {
          display: none;
        }
        svg path, svg rect{
          fill: #FF6700;
        }
    </style><div class$="${visible ? '' : 'hidden'}" title="spinner">${spinnerIcon}</div>`;
  }
  _didRender() {
    ;
  }
  _firstRendered() {
      /*
    */
  }
}
customElements.define('map-spinner', MapSpinner);
