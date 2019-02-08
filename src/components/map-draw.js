
import {LitElement, html} from '@polymer/lit-element';
/**
* @polymer
* @extends HTMLElement
*/
class MapDraw extends LitElement {
  static get properties() { 
    return {
      active: {type: Boolean},
      map: {type: Object}
    }; 
  }
  constructor() {
      super();
      this.map = null;
      this.active = false;
  }
  createRenderRoot() {
    return this;
  }
  shouldUpdate(changedProp){
    if (changedProp.has('map')){
      if (this.map && this.active) {
        this._addDrawToMap();
      }
    }
    if (changedProp.has('active')) {
      if (this.active) {
        this._addDrawToMap();
      } else {
        this._removeDrawFromMap();
      }
    }
    return true;
  }
  render() {
    return html`
      <style>
      @import "${document.baseURI}node_modules/@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
      </style>
    `
  }
  _addDrawToMap(){ 
    if (this.map) {
      // store map.boxZoom
      this.boxZoomable = this.map.boxZoom.isEnabled();
      this.draw = new MapboxDraw({
        displayControlsDefault: true,
        defaultMode: 'draw_polygon'
      });
      this.map.addControl(this.draw, 'bottom-right');   
    }
  }
  _removeDrawFromMap()
  {
    if (this.map) {
      this.map.removeControl(this.draw);
      // restore map.boxZoom
      if (this.boxZoomable) {
        this.map.boxZoom.enable();
      } else {
        this.map.boxZoom.disable();
      }      
    }
  }
}
customElements.define('map-draw', MapDraw);
