class PitchControl {
  onAdd(map) {
    this.pitch = 0;
    this._map = map;
    this._container = document.createElement('div');
    this._container.innerHTML = "<button>3D</button>";
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group mapboxgl-ctrl-pitch';
    
    this.addEventListeners();
    
    return this._container;
  }
  
  updatePitch(e) {
    if (this._map) {
      switch (this.pitch) {
        case 0:
          this.pitch = 60;
          break;
        case 60: 
          this.pitch = 30;
          break;
        case 30:
        default:
          this.pitch = 0;
          break;
      }
      this._map.setPitch(this.pitch);
    }
  }
  
  addEventListeners (){
    this._container.addEventListener('click', this.updatePitch.bind(this) );
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

import './map-iconbutton';

import {LitElement, html} from '@polymer/lit-element';
class Map3D extends LitElement {
  static get properties() { 
    return { 
      webmap: Object,
      active: Boolean
    }; 
  }
  constructor() {
    super();
    // initialize members
    this.control = null;
    this.changed = false;
    // initialize properties
    this.webmap = null;
    this.active = false;
  }
  removeControl(webmap) {
    if (webmap && this.control) {
      webmap.removeControl(this.control);
      this.control = null;
    }
  }
  addControl(webmap) {
    if (webmap) {
      this.removeControl(webmap);
      this.control = new PitchControl();
      webmap.addControl(this.control);
    }
  }
  _shouldRender(props, changedProps, prevProps) {
    if (changedProps.webmap) {
      this.removeControl(prevProps.webmap);      
    }
    return props.webmap !== null;
  }
  _render({webmap, active}) {
    if (active) {
      this.addControl(webmap);
      /*if (this.control) {
        const content = html`<style>button{color:red}</style><button>Bla</button>`;
        this.control._container.innerHTML = content.getHTML();
      }*/
    } else {
      this.removeControl(webmap);
    }
    return html``;
  }
}
customElements.define('map-3d', Map3D);
