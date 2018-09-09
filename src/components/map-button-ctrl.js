/* 
  map-button-ctrl defines custom element <map-button-ctrl>
  When used inside <web-map>, it adds a control button to the map.
  When the control-button is clicked, it triggers a "mapbuttoncontrolclick" event, identifiable by 
  the event.detail.ctrlid property

  map-button-ctrl has the following properties:

  
  webmap: Object, // the map to add the control to
  position: String, // position of control: "none", "top-left", "top-right", "bottom-left", "bottom-right", "bar-left", "bar-right"
  icon: Object, // icon: html or svg template
  controlid: String, // CustomEvent name when clicked
  tooltip: String // Optional tooltip info 
*/


import {LitElement, html} from '@polymer/lit-element';
class ControlIconButton extends LitElement {
  static get properties() { 
    return { 
      tooltip: String
    }; 
  }
  constructor() {
      super();
      this.tooltip = "";
  }
  _render({tooltip}) {
    return html`<style>
        button {
          display: block;
          width: 30px;
          height: 30px;
          padding: 0;
          outline: none;
          border: 0;
          box-sizing: border-box;
          background-color: transparent;
          cursor: pointer;          
        }
        .button:hover {
          background-color: rgba(0,0,0,0.05);
        }
    </style>
    <button title$="${tooltip}" class="button"><slot></slot></button>`;
  }
}
customElements.define('control-icon-button', ControlIconButton);

class ButtonControl {
  constructor (icon, clickHandler, tooltip)
  {
    this.icon = icon;
    this.clickHandler = clickHandler;
    if (tooltip) {
      this.tooltip = tooltip;
    } else {
      this.tooltip = "";
    }
  }
  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.innerHTML = `<control-icon-button tooltip="${this.tooltip}">${this.icon.strings[0]}</control-icon-button>`;
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group mapboxgl-ctrl-pitch';
    
    this._container.addEventListener('click', this.clickHandler);
    
    return this._container;
  }
  
  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

class MapButtonControl extends LitElement {
  static get properties() { 
    return { 
      /* the map to add the control to */
      webmap: Object, 
      /* position of control: "none", "top-left", "top-right", "bottom-left", "bottom-right", "bar-left", "bar-right" */
      position: String, 
      /* icon: html or svg template */
      icon: Object, 
      /* CustomEvent name when clicked */
      controlid: String,
      /* Optional tooltip info */
      tooltip: String
    }; 
  }
  constructor() {
    super();
    // initialize members
    this._control = null;
    // initialize properties
    this.webmap = null;
    this.position = "top-left";
    this.tooltip = "";
  }
  buttonClicked(e) {
    this.dispatchEvent(new CustomEvent("mapbuttoncontrolclick", {
      detail: {
        controlid: this.controlid,
        event: e
      },
      bubbles: true,
      composed: true
    }));
  }
  removeControl(webmap) {
    if (webmap && this._control) {
      webmap.removeControl(this._control);
      this._control = null;
    }
  }
  addControl(webmap, position, icon, controlId, tooltip) {
    if (webmap) {
      this.removeControl(webmap);
      this._control = new ButtonControl(icon, this.buttonClicked.bind(this), tooltip);
      webmap.addControl(this._control, position);
    }
  }
  _shouldRender(props, changedProps, prevProps) {
    if (changedProps && changedProps.webmap && prevProps && prevProps.webmap) {
      this.removeControl(prevProps.webmap);      
    }
    return props.webmap !== null;
  }
  _render({webmap, position, icon, controlid, tooltip}) {
    if (position !== "none") {
      this.addControl(webmap, position, icon, controlid, tooltip);
    } else {
      this.removeControl(webmap);
    }
    return html``;
  }
}
customElements.define('map-button-ctrl', MapButtonControl);
