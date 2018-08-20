


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
      this.visible = true;
      this.webmap = null;
  }
  showSpinner() {
    this.visible = true;
  }
  hideSpinner() {
    if(this.webmap.loaded()) {
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
    </style><div class$="${visible ? '' : 'hidden'}" title="spinner"><img src="${this.baseURI}/images/spinner.gif" alt="Loading..."></div>`;
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
