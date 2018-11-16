/*
 mapbox-gl zoomcontrol, copied from 
 https://github.com/maputnik/editor/blob/master/src/libs/zoomcontrol.js
 to be used as follows:

 import ZoomControl from '../../libs/zoomcontrol';
 const zoom = new ZoomControl();
 map.addControl(zoom, 'top-right');

*/

export default class ZoomControl {
  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group mapboxgl-ctrl-zoom';
    this._container.innerHTML = `
    <style>
      .zoomlevelbox {
        padding: 2px;        
      }
      .zoomlevelbox input {
        position: relative;
        width: 50px;
        border: 0;
      }
      .zoomlevelbox input:hover{
        border-bottom: 1px solid DeepSkyBlue;
      }
    </style>
    <div class="zoomlevelbox">Zoom: <input type="text" value="${this._map.getZoom().toFixed(2)}" >
    </div>`;
    
    this.addEventListeners();
    
    return this._container;
  }
  
  updateZoomLevel(e) {
    this.autoZoomChange = true;
    this._container.querySelector('input').value=this._map.getZoom().toFixed(2);
    this.autoZoomChange = false;
  }
  userZoomChange(e) {
    if (this.autoZoomChange) {
      return;
    }
    let value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      if (value < this._map.getMinZoom()) {
        value = this._map.getMinZoom();
      }
      if (value > this._map.getMaxZoom()) {
        value = this._map.getMaxZoom();
      }
      this._map.zoomTo(value);
    } else {
      this.autoZoomChange = true;
      this._container.querySelector('input').value=this._map.getZoom().toFixed(2);
      this.autoZoomChange = false;
    }
  }
  addEventListeners (){
    this._map.on('load', this.updateZoomLevel.bind(this) );
    this._map.on('zoomend', this.updateZoomLevel.bind(this) );
    this._container.querySelector('input').addEventListener('change', (e)=>this.userZoomChange(e));
  }

  removeEventListeners() {
    /* todo */
  }

  onRemove() {
    this.removeEventListeners();
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}
