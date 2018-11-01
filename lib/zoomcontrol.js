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
    
    this.addEventListeners();
    
    return this._container;
  }
  
  updateZoomLevel() {
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
    </style>
    <div class="zoomlevelbox">Zoom: <input type="text" list="zoomlevels" value="${this._map.getZoom().toFixed(2)}" >
    <datalist id="zoomlevels">
      <option>0</option>
      <option>1</option>
      <option>2</option>
      <option>3</option>
      <option>4</option>
      <option>5</option>
      <option>6</option>
      <option>7</option>
      <option>8</option>
      <option>9</option>
      <option>10</option>
      <option>11</option>
      <option>12</option>
      <option>13</option>
      <option>14</option>
      <option>15</option>
      <option>16</option>
    </datalist>
    </div>`;
  }
  
  addEventListeners (){
    this._map.on('load', this.updateZoomLevel.bind(this) );
    this._map.on('zoomend', this.updateZoomLevel.bind(this) );
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}
