
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
    /*toFrontWorldHalf(startPoint);
    toFrontWorldHalf(endPoint);
    */
    
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
      // initialise variables
      this._boundHandleClick = this.handleMapClick.bind(this);
      this._boundHandleMapMouseMove = this.handleMapMouseMove.bind(this);
      this.lineStartPoint = null;
      this.lineEndPoint = null;
      this.geojson = {
        "type": "FeatureCollection",
        "features": []
      };
      // set property defaults
      this.visible = true;
      this.active = false;
      this.webmap = undefined;
  }
  handleMapMouseMove(e) {
    let features = this.webmap.queryRenderedFeatures(e.point, { layers: ['map-measure-points']});
    this.webmap.getCanvas().style.cursor = (features.length) ? 'pointer' : 'crosshair';
  }
  handleMapClick(e) {
    if (this.webmap) {
      const map = this.webmap;
      const clickedFeatures = map.queryRenderedFeatures(e.point, { layers: ['map-measure-points'] });

      // Remove the linestrings from the group
      // So we can redraw it based on the points collection
      this.geojson.features = this.geojson.features.filter(curfeature=>curfeature.geometry.type=="Point");

      // Clear the Distance container to populate it with a new value
      //  distanceContainer.innerHTML = '';

      // If a point feature was clicked, remove it from the map
      if (clickedFeatures.length) {
        const id = clickedFeatures[0].properties.id;
        this.geojson.features = this.geojson.features.filter(function(point) {
                return point.properties.id !== id;
            });
      } else {
        this.geojson.features.push(
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                e.lngLat.lng,
                e.lngLat.lat
              ]
            },
            "properties": {
              "id": String(this.geojson.features.length + 1)
            }
          }
        );
      }

      // add line through points
      const pointCount = this.geojson.features.length;
      if (pointCount > 1) {
        for (let i = 1; i < pointCount; i++) {
          this.geojson.features.push(
            {
              "type": "Feature",
              "geometry" : {
                "type": "LineString",
                "coordinates": getPointsAlongLine(this.geojson.features[i-1].geometry.coordinates, this.geojson.features[i].geometry.coordinates)
              }
            }
          );
        }

        // Populate the distanceContainer with total distance
        /*
        var value = document.createElement('pre');
         value.textContent = 'Total distance: ' + turf.lineDistance(linestring).toLocaleString() + 'km';
            distanceContainer.appendChild(value);
        */
      }
      map.getSource('map-measure-geojson').setData(this.geojson);
    };
  };
  toggleActive(e) {
    this.active = !this.active;
    if (this.webmap) {
      if (this.active) {
        // setup measuring on map
        this.webmap.addSource('map-measure-geojson', {
          "type":"geojson", 
          "data":this.geojson
        });
        this.webmap.addLayer({        
          "id": "map-measure-line",
          "type": "line",
          "source": "map-measure-geojson",
          "layout": {
              "line-join": "round",
              "line-cap": "round"
          },
          "paint": {
              "line-color": "#c30",
              "line-width": 3,
              "line-dasharray": [3, 2]
          },
          "filter": ['in', '$type', 'LineString']
        });
        this.webmap.addLayer({
          "id": "map-measure-points",
          "type": "circle",
          "source": "map-measure-geojson",            
          "paint": {
            "circle-radius": 5,
            "circle-color": '#000'
          },
          "filter": ['>', 'id', '']
        });
        this.webmap.on('click', this._boundHandleClick);
        this.webmap.on('mousemove', this._boundHandleMapMouseMove);
      } else {
        // remove measuring from map
        this.lineStartPoint = null;
        this.lineEndPoint = null;
        this.webmap.off('click', this._boundHandleClick);
        this.webmap.off('mousemove', this._boundHandleMapMouseMove);
        this.webmap.removeLayer('map-measure-line');
        this.webmap.removeLayer('map-measure-points');
        this.webmap.removeSource('map-measure-geojson');
        this.geojson.features = [];
        this.webmap.getCanvas().style.cursor = '';
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
