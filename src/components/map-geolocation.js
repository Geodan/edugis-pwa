import {LitElement, html} from '@polymer/lit-element';

const startUpMessage = 'Starten plaatsbepaling...';

/**
* @polymer
* @extends HTMLElement
*/
class MapGeolocation extends LitElement {
  static get properties() { 
    return { 
      active: Boolean,
      message: String,
      webmap: Object
    }; 
  }
  constructor() {
      super();
      this.active = false;
      this.latitude = 0;
      this.longitude = 0;
      this.tracking = false;
      this.message = startUpMessage;
      this.watchId = 0;
      this.webmap = undefined;
      this.flownTo = false;
      this.geojson = {
        "type": "FeatureCollection",
        "features": []
      };
  }
  geoJSONCircle (pos, radius, points) {
    if(!points) points = 64;

    const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
    };

    const km = radius / 1000.0;

    const ret = [];
    const distanceX = km/(111.320*Math.cos(coords.latitude*Math.PI/180));
    const distanceY = km/110.574;

    let theta, x, y;
    for(let i=0; i<points; i++) {
        theta = (i/points)*(2*Math.PI);
        x = distanceX*Math.cos(theta);
        y = distanceY*Math.sin(theta);

        ret.push([coords.longitude+x, coords.latitude+y]);
    }
    ret.push(ret[0]);

    return {
       "type": "Feature",
       "geometry": {
          "type": "Polygon",
          "coordinates": [ret]
        }
    };
  };
  geojSONPoint(pos) {
    return {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [pos.coords.longitude, pos.coords.latitude]
      }
    }
  }
  success(pos){
    this.message = html`Locatie:<br>
    Breedte: ${pos.coords.latitude}<br>
    Lengte: ${pos.coords.longitude}<br>
    Nauwkeurigheid: ${pos.coords.accuracy} m`;
    this.requestUpdate();
    if (this.webmap) {
      this.geojson.features = [];
      this.geojson.features.push(this.geoJSONCircle(pos, pos.coords.accuracy));
      this.geojson.features.push(this.geojSONPoint(pos));
      this.webmap.getSource('map-geolocate').setData(this.geojson);
      if (!this.flownTo) {
        let zoom = this.webmap.getZoom();
        if (zoom < 15) {
          zoom = 15;
        }
        this.webmap.flyTo({center:[pos.coords.longitude,pos.coords.latitude], zoom:zoom});
        this.flownTo = true;
      }
    }
  }
  error(err) {
    this.message = `Fout: ${err.code} : ${err.message}`;
  }
  prepareMap() {
    if (this.webmap) {
      this.webmap.addSource('map-geolocate', {
        "type":"geojson", 
        "data":this.geojson
      });
      this.webmap.addLayer({
        "id": "map-geolocate-radius",
        "type": "fill",
        "source": "map-geolocate",            
        "paint": {
          "fill-color": "rgba(149,201,253,0.3)",
          "fill-outline-color": "rgb(66,133,244)",
        },
        "filter": [
          "all", 
          ["==", "$type", "Polygon"]
        ]
      });
      this.webmap.addLayer({
        "id": "map-geolocate-point",
        "type": "circle",
        "source": "map-geolocate",     
        "paint": {
          "circle-radius": 10,
          "circle-color": "rgb(66,133,244)",
          "circle-stroke-color" : "#fff",
          "circle-stroke-width" : 1,
          "circle-pitch-alignment" : "map"
        },
        "filter": [
          "all", 
          ["==", "$type", "Point"]
        ]
      });
    }
    this.flownTo = false;
    this.watchId = navigator.geolocation.watchPosition(this.success.bind(this), this.error.bind(this), {enableHighAccuracy: true, timeout: 45000, maximumAge: 0});
  }
  clearMap() {
    navigator.geolocation.clearWatch(this.watchId);
    this.watchId = 0;
    this.message = startUpMessage;
    if (this.webmap) {
      this.webmap.removeLayer('map-geolocate-radius');
      this.webmap.removeLayer('map-geolocate-point');
      this.webmap.removeSource('map-geolocate');
    }
  }
  render() {
    if (!this.active) {
      if (this.watchId != 0) {
        this.clearMap();
      }
      return html``;
    }
    if (!this.watchId) {
      this.prepareMap();      
    }
    return html`
    <div>
      ${this.message}
    </div>`;
  }
}
customElements.define('map-geolocation', MapGeolocation);
