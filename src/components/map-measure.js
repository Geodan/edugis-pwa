import './map-iconbutton';
import { measureIcon } from '../gm/gm-iconset-svg';

/***
 * the following crashes polymer build, moved script load to index.html ?? :
  import {along as turfAlong,
  area as turfArea,
  bearing as turfBearing, 
  distance as turfDistance, 
  length as turfLength, 
  lineString as turfLineString,
  polygon as turfPolygon} from '../../node_modules/@turf/turf/turf.es';
*/

// get geographic coordinates along line A to B
function getPointsAlongLine(startPoint, endPoint)
{
    const degrees = {"units": "degrees"};
    const line = turf.lineString([startPoint, endPoint]);
    const length = turf.length(line, degrees);
    const count = Math.ceil(length / 1); // steps of 1 degree
    const dist = length / count;
    const points = [];
    for (var i = 0; i < count; i++) {
        const along = turf.along(line, 0.00000001 + i * dist, degrees);
        points.push(along.geometry.coordinates);
    }
    points.push(turf.along(line, length, degrees).geometry.coordinates);
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

function formatArea(a) {
  if (a  < 10000) {
    return html`${Math.round(a)} m<sup>2</sup>`
  }
  if (a < 100000) {
    const hectares = Math.round(a /100) / 100;
    return  `${hectares} ha`;
  }
  if (a < 1000000) {
    const hectares = Math.round(a /1000) / 10;
    return  `${hectares} ha`;
  }
  if (a < 10000000){
    const km2 = Math.round(a / 10000) / 100;
    return html`${km2} km<sup>2<sup>`;
  }
  if (a < 100000000){
    const km2 = Math.round(a / 100000) / 10;
    return html`${km2} km<sup>2<sup>`;
  }
  return html`${Math.round(a / 1000000)} km<sup>2</sup>`
}

import {LitElement, html} from '@polymer/lit-element';
/**
* @polymer
* @extends HTMLElement
*/
class MapMeasure extends LitElement {
  static get properties() { 
    return { 
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
      this.geojson = {
        "type": "FeatureCollection",
        "features": []
      };
      // set property defaults      
      this.active = this.activated = false;
      this.webmap = undefined;
      this.header = html`<h5>Afstand meten</h5>`;
      this.startMessage = html`${this.header}Klik in de kaart om afstand of oppervlakte te meten.`;
      this.measureInfo = this.startMessage;
  }
  handleMapMouseMove(e) {
    let features = this.webmap.queryRenderedFeatures(e.point, { layers: ['map-measure-points']});
    this.webmap.getCanvas().style.cursor = (features.length) ? 'pointer' : 'crosshair';
  }
  resetMeasurement()
  {
    this.geojson.features = [];
    this.hasPolygon = false;
    const source = this.webmap.getSource('map-measure-geojson');
    if (source) {
      source.setData(this.geojson);
    }
  }
  handleMapClick(e) {
    if (this.webmap) {
      let clickedFeatures = this.webmap.queryRenderedFeatures(e.point, { layers: ['map-measure-points'] });
      if (this.hasPolygon) {
        this.resetMeasurement();
        clickedFeatures = [];
      }
      
      // Remove the linestrings from the group
      // So we can redraw it based on the points collection
      this.geojson.features = this.geojson.features.filter(curfeature=>curfeature.geometry.type=="Point");
 
      let point = [e.lngLat.lng, e.lngLat.lat];
      if (clickedFeatures.length) {
        const clickedID = clickedFeatures[0].properties.id;
        // an existing point was clicked
        if (this.geojson.features.length > 2 && this.geojson.features[0].properties.id === clickedID) {
          // closing polygon
          this.hasPolygon = true;
          point = this.geojson.features[0].geometry.coordinates;
          this.geojson.features.push(
            {
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": point
              },
              "properties": {
                "id": (this.geojson.features.length + 1).toString()
              }
            }
          );
        } else {
          if (this.geojson.features[this.geojson.features.length -1].properties.id === clickedID) {
            // clicked last point
            this.resetMeasurement();
          }
        }
      } else {
        // add a new point
        this.geojson.features.push(
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": point
            },
            "properties": {
              "id": (this.geojson.features.length + 1).toString()
            }
          }
        );
      }

      // add line through points, calculate distance
      let distance = 0.0;
      let area = 0.0;
      const options = {units: 'kilometers'};
      const pointCount = this.geojson.features.length;
      let polygon = [];
      if (pointCount > 1) {
        this.measureInfo = html`${this.header}Klik volgend punt. <br>Klik op laatste punt om te stoppen.`;
        if (pointCount > 2) {
          this.measureInfo = html`${this.measureInfo}<br>Klik op eerste punt voor oppervlakte.`;
        }
        for (let i = 1; i < pointCount; i++) {
          const point1 = this.geojson.features[i-1].geometry.coordinates;
          const point2 = this.geojson.features[i].geometry.coordinates;
          const lineDistance = turf.distance(point1, point2, options);
          distance += lineDistance;
          const line = getPointsAlongLine(point1, point2);
          this.geojson.features.push(
            {
              "type": "Feature",
              "geometry" : {
                "type": "LineString",
                "coordinates": line
              },
              "properties": {
                "length": formatDistance(lineDistance, options.units)
              }
            }
          );
          if (this.hasPolygon) {
            polygon.push(...line);
          }
        }
        if (polygon.length) {
          polygon.push(polygon[0]);
          const p = turf.polygon([polygon]);
          area = turf.area(p);
          this.geojson.features.push(
            {
              "type": "Feature",
              "geometry": {
                "type": "Polygon",
                "coordinates": [polygon]
              },
              "properties": {
                "area": area,
                "perimeter": formatDistance(distance, options.units)
              }
            }
          )
        }
        this.measureInfo = html`${this.measureInfo}<br>${area>0.0?"Omtrek:": "Afstand:"} <span class="label">${formatDistance(distance, options.units)}</span>
          ${polygon.length==0?
            html`<br>Kompashoek (start-eind): <span class="label">${
              turf.bearing(this.geojson.features[0].geometry.coordinates, this.geojson.features[pointCount -1].geometry.coordinates).toFixed(0)
              } &deg;</span>`:''}
          ${area>0.0?html`<br>Oppervlakte: <span class="label">${formatArea(area)}</span>`:""}`
      } else {
        if (pointCount == 0) {
          this.measureInfo = this.startMessage;
        } else {
          // pointCount == 1
          this.measureInfo = html`${this.header}Klik volgend punt`;
        }        
      }
      try {
        this.webmap.getSource('map-measure-geojson').setData(this.geojson);
      } catch(e) {
        console.warn('map-measure source-layer missing');
      }
    };
  };
  updateActivation() {
    if (this.active === this.activated) {
      return;
    }
    this.activated = this.active;
    if (this.webmap) {
      if (this.activated) {
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
            "circle-color": ["match", 
              ["get", "id"], 
              "1", "#000", 
              "#999"]
          },
          "filter": ['>', 'id', '']
        });
        this.webmap.addLayer({
          "id": "map-measure-surface",
          "type": "fill",
          "source": "map-measure-geojson",
          "filter": ['==', '$type', "Polygon"],
          "layout": {
            "visibility": "visible"
          },
          "paint": {
            "fill-color": "#c30",
            "fill-opacity": 0.4
          }
        })
        this.webmap.addLayer({
          "id": "map-measure-line-length",
          "type": "symbol",
          "source": "map-measure-geojson",
          "filter": ['==', '$type', 'LineString'],
          "layout": {
            "symbol-placement": "line",
            "text-field": "{length}",
            "text-size": 14,
            "text-rotation-alignment": "map",
            "visibility": "visible"
          },
          "paint": {
            "text-color": "#000",
            "text-halo-color": "#fff",
            "text-halo-width": 4
          }
        });
        this.webmap.on('click', this._boundHandleClick);
        this.webmap.on('mousemove', this._boundHandleMapMouseMove);
      } else {
        // remove measuring from map
        this.webmap.off('click', this._boundHandleClick);
        this.webmap.off('mousemove', this._boundHandleMapMouseMove);
        if (this.webmap.isStyleLoaded()) { // false if webmap got replaced
          this.webmap.removeLayer('map-measure-line');
          this.webmap.removeLayer('map-measure-points');
          this.webmap.removeLayer('map-measure-line-length');
          this.webmap.removeLayer('map-measure-surface');
          this.webmap.removeSource('map-measure-geojson');  
        }
        this.geojson.features = [];
        this.webmap.getCanvas().style.cursor = '';
        this.measureInfo = this.startMessage;
      }
    }
  }
  shouldUpdate(changedProperties) {
    if (changedProperties.has('active')) {
      this.updateActivation();
    }
    return true;
  }
  render() {
    if (!this.active) {
      return html``;
    }
    return html`<style>        
        .measureinfo {
          width: 100%;
          font-size: 14px;
        }
        .measureinfo h5 {
          color: #555;
          font-weight: bold;
          font-size: 14px;
        }
        .label {
          background-color: #32b4b8;
          color: white;
          font-weight: bold;
        }
    </style>
    <div class="measureinfo">${this.measureInfo}</div>`
  }
}
customElements.define('map-measure', MapMeasure);
