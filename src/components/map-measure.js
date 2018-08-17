
import './map-iconbutton';
import { rulerIcon } from './my-icons.js';

import {lineString as turfLineString} from '../../node_modules/@turf/turf/turf.es';
import {along as turfAlong} from '../../node_modules/@turf/turf/turf.es';
import {length as turfLength} from '../../node_modules/@turf/turf/turf.es';
import {distance as turfDistance, bearing as turfBearing} from '../../node_modules/@turf/turf/turf.es';

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

function formatDistance(d, units) {
  // units is one of kilometers, miles, degrees
  switch (units) {
    case 'kilometers':
      if (d < 0.01) {
        return (Math.round(d * 10000)/10).toFixed(1) + " m";
      }
      if (d < 2.0) {
        return (Math.round(d * 1000)).toFixed(0) + " m";
      }
      if (d < 10) {
        return d.toFixed(2) + " km";
      }
      if (d < 100) {
        return d.toFixed(1) + " km";
      }
      return d.toFixed(0) + " km";
    break;
  }
}

import {LitElement, html} from '@polymer/lit-element';
class MapMeasure extends LitElement {
  static get properties() { 
    return { 
      visible: Boolean,
      active: Boolean,
      webmap: Object,
      measureInfo: String
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
      this.measureInfo = "Hier komt de meetinformatie";
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

      // If a point feature was clicked, not closing polygon
      if (clickedFeatures.length && !(this.geojson.features.length > 2 && this.geojson.features[0].properties.id === clickedFeatures[0].properties.id)) {
        // remove clicked point
        this.geojson.features = this.geojson.features.filter(function(point) {
          return point.properties.id !== clickedFeatures[0].properties.id;
        });
      } else {
        // add a new point
        let point = [e.lngLat.lng, e.lngLat.lat];
        if (clickedFeatures.length) {
          // set point identical to starting point
          point = this.geojson.features[0].geometry.coordinates;
        }
        this.geojson.features.push(
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": point
            },
            "properties": {
              "id": String(new Date().getTime())
            }
          }
        );
      }

      // add line through points, calculate distance
      let distance = 0.0;
      const options = {units: 'kilometers'};
      const pointCount = this.geojson.features.length;
      if (pointCount > 1) {
        for (let i = 1; i < pointCount; i++) {
          const point1 = this.geojson.features[i-1].geometry.coordinates;
          const point2 = this.geojson.features[i].geometry.coordinates;
          const lineDistance = turfDistance(point1, point2, options);
          distance += lineDistance;
          this.geojson.features.push(
            {
              "type": "Feature",
              "geometry" : {
                "type": "LineString",
                "coordinates": getPointsAlongLine(point1, point2)
              },
              "properties": {
                "length": formatDistance(lineDistance, options.units)
              }
            }
          );
          this.measureInfo = html`${formatDistance(distance, options.units)}<br/> ${turfBearing(this.geojson.features[0].geometry.coordinates, this.geojson.features[pointCount -1].geometry.coordinates).toFixed(0)} &deg;`
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
        this.webmap.addLayer({
          "id": "map-measure-line-length",
          "type": "symbol",
          "source": "map-measure-geojson",
          "filter": ['==', '$type', 'LineString'],
          "layout": {
            "symbol-placement": "line",
            "text-field": "{length}",
            "text-font": ["Noto Sans Regular"],
            //"text-letter-spacing": 0.1,
            "text-size": 14,
            "text-rotation-alignment": "map",
            "visibility": "visible"
          },
          "paint": {
            "text-color": "#000",
            "text-halo-color": "#fff",
            "text-halo-width": 4
          }
        })
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
        this.webmap.removeLayer('map-measure-line-length');
        this.webmap.removeSource('map-measure-geojson');
        this.geojson.features = [];
        this.webmap.getCanvas().style.cursor = '';
      }
    }
  }
  _render({visible, active, measureInfo}) {
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
    <div class$="measureinfo${active?'':' hidden'}">${measureInfo}<br/>en nog meer</div>`
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
