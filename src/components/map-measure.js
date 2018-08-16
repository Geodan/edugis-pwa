
import './map-iconbutton';
import { rulerIcon } from './my-icons.js';

import {lineString as turfLineString} from '../../node_modules/@turf/turf/turf.es';
import {along as turfAlong} from '../../node_modules/@turf/turf/turf.es';
import {length as turfLength} from '../../node_modules/@turf/turf/turf.es';

// translate point to between -180 and +180 degrees
function toFrontWorldHalf(point) {
  if (point[0] < -180) {
      point[0] = 180 + (point[0] % 180)
  } else if (point[0] > 180) {
      point[0] = -180 + (point[0] % 180);
  }
  return point;
}

// get geographic coordinates along line A to B
function getPointsAlongLine(startPoint, endPoint)
{
    toFrontWorldHalf(startPoint);
    toFrontWorldHalf(endPoint);
    
    const degrees = {"units": "degrees"};
    const line = turfLineString([startPoint, endPoint]);
    const length = turfLength(line, degrees);
    const count = Math.ceil(length / 1); // steps of 1 degree
    const dist = length / count;
    const points = [];
    for (var i = 0; i < count; i++) {
        const along = turfAlong(line, 0.00000001 + i * dist, degrees);
        points.push(along.geometry.coordinates);
    }
    points.push(turfAlong(line, length, degrees).geometry.coordinates);
    //points.push(line.geometry.coordinates[1]);
    return points;
}

import {LitElement, html} from '@polymer/lit-element';
class MapMeasure extends LitElement {
  static get properties() { 
    return { 
      visible: Boolean,
      active: Boolean,
      webmap: Object
    }; 
  }
  constructor() {
      super();
      this.info = "Afstandsmeter";
      this.visible = true;
      this.active = false;
      this.webmap = undefined;
      this.lineStartPoint = null;
      this.lineEndPoint = null;
      this.geojsonLine = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": []
            },
            "properties": {            
            }
        }]
      };
      this.geojsonPoints = {
        "type": "FeatureCollection",
        "features": [{
          "type": "Feature",
          "geometry": {
            "type":  "Point",
            "coordinates": []
          }
        }]
      }
  }
  handleMapClick(e) {
    if (this.webmap) {
      const shortestLineLayer = this.webmap.getSource('shortestline');
      if (shortestLineLayer) {
        let lng = e.lngLat.lng;
        let lat = e.lngLat.lat;
        const clickPoint = [lng, lat];
        if (!this.lineStartPoint) {
          this.lineStartPoint = clickPoint;
          return;
        }
        const points = getPointsAlongLine(this.lineStartPoint, clickPoint);
        this.geojsonLine.features[0].geometry.coordinates = points;
        shortestLineLayer.setData(this.geojsonLine);
      }
    }
  }
  toggleActive(e) {
    this.active = !this.active;
    if (this.webmap) {
      if (this.active) {
        // setup measuring on map
        this.webmap.addLayer({        
          "id": "shortestline",
          "type": "line",
          "source": {            
              "type": "geojson",
              "data": this.geojsonLine,
          },
          "layout": {
              "line-join": "round",
              "line-cap": "round"
          },
          "paint": {
              "line-color": "#c30",
              "line-width": 3,
              "line-dasharray": [3, 2]
          }
        });
        this.webmap.on('click', this.handleMapClick.bind(this));
      } else {
        // remove measuring from map
        this.lineStartPoint = null;
        this.lineEndPoint = null;
        this.webmap.off('click', this.handleMapClick.bind(this));
        this.webmap.removeLayer('shortestline');
        this.webmap.removeSource('shortestline');
      }
    }
  }
  _render({visible, active}) {
    return html`<style>
        .hidden {
          visibility: hidden;
        }
        .measureinfo {
          position: absolute;
          top: 37px;
          left: calc(-15em + 16px);
          width: 30em;
          box-sizing: border-box;
          background-color: rgba(255, 255, 255, 0.75);
          box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
          border-radius: 4px;
          padding-left: 2px;
          text-align: center;
          font-size: 12px;
        }
    </style>
    <map-iconbutton class$="${this.visible?'':'hidden'}" info="${this.info}" icon=${rulerIcon} on-click="${(e)=>this.toggleActive(e)}"></map-iconbutton>
    <div class$="measureinfo${active?'':' hidden'}">Hier komt meetinformatie<br/>en nog meer</div>`
  }
  _didRender() {
    ;
  }
  _firstRendered() {
      /*
    */
  }
}
customElements.define('map-measure', MapMeasure);
