import {LitElement, html, svg, css} from 'lit-element';
import {GeoJSON} from '../utils/geojson';
import GeoJSONParser from '../../node_modules/jsts/org/locationtech/jts/io/GeoJSONParser';
import DistanceOp from '../../node_modules/jsts/org/locationtech/jts/operation/distance/DistanceOp';

const dummyIcon = svg`<svg height="24" width="24" viewbox="0 0 24 24"><style>.normal{ font: bold 18px sans-serif;}</style><text x="4" y="16" class="normal">A</text></svg>`;

/**
* @polymer
* @extends HTMLElement
*/
class MapDataToolDistance extends LitElement {
  static get properties() { 
    return {
      map: {type: Object},
      buttonEnabled : {type: Boolean}
    }; 
  }
  static get styles() {
    return css`
      select {max-width: calc(100% - 10px)}
      .buttoncontainer {border: 1px solid gray; border-radius:4px;padding:2px;fill:gray;width:150px;margin-top:5px;}
    `
  }
  constructor() {
      super();
      this.map = null;
      this.buttonEnabled = false;
  }
  render() {
    return html`
      <b>Afstand</b>
      <p>Bereken de kortste afstand van alle elementen in een kaartlaag naar de dichtsbijzijnde elementen in een andere kaartlaag</p>
      <p><b>Invoer:</b> 2 kaartlagen</p>
      <p><b>Uitvoer:</b> 1 nieuwe kaartlaag met afstanden</p>
      <b>Eerste kaartlaag:</b>
      ${this._renderLayerList()}
      <b>Tweede kaartlaag:</b>
      ${this._renderLayerList()}
      <div class='buttoncontainer'><map-iconbutton @click="${e=>this._handleClick(e)}" .disabled="${!this.buttonEnabled}" info="berekenen">Berekenen</map-icon-button></div>
    `
  }
  _renderLayerList() {
    const layers = this.map.getStyle().layers.filter(layer=>layer.metadata && !layer.metadata.reference && !layer.metadata.isToolLayer);
    if (layers.length < 2) {
      return html`${layers.length} kaartlagen aanwezig (minimmaal 2 nodig)`;
    }
    return html`<select @change="${e=>this._layerSelected(e)}">
    ${layers.map(layer=>html`<option value=${layer.id}>${layer.metadata.title?layer.metadata.title:layer.id}</option>`)}
    </select>`
  }
  _layerSelected(e) {
    const selections = this.shadowRoot.querySelectorAll('select');
    this.buttonEnabled = (selections.length === 2 && (selections[0].value != selections[1].value))
  }
  _getFeatures(layerid) {
    const layer = this.map.getLayer(layerid);
    const source = this.map.getSource(layer.source);
    switch (source.type) {
      case "geojson":
        return source.serialize().data;
      case "vector":
        //const result = this.map.querySourceFeatures(layerid, layer.sourceLayer?{sourceLayer:layer.sourceLayer}:undefined);
        const result = this.map.queryRenderedFeatures({layers:[layerid]});
        const geojson = {
          "type": "FeatureCollection",
          "features": result.map(vectorFeature=>{
            return {
              "type": "Feature",
              "properties": vectorFeature.properties,
              "geometry": vectorFeature.geometry
            }
          })
        }
        return geojson;
      default:
        console.log(`unhandled source type: ${source.type}`);
        return [];
    }
  }
  _calculateDistancess(layer1id, layer2id) {
    const features1 = this._getFeatures(layer1id);
    const features2 = this._getFeatures(layer2id);

    const distanceGeojson = {
      "type": "FeatureCollection",
      "features": []
    }
    const geoJSONParser = new GeoJSONParser();
    
    for (let feature1 of features1.features) {
      let minDistance = 50000;
      let resultFeature1, resultFeature2;
      for (let feature2 of features2.features) {
        //const jstGeom1 = geoJSONParser.read(feature1);
        //const jstGeom2 = geoJSONParser.read(feature2);
        //const distanceOp = new DistanceOp(jstGeom1, jstGeom2);
        //const distance = distanceOp.distance();
    
        const distance = turf.distance(feature1, feature2);
        
        if (distance < minDistance) {
          minDistance = distance;
          resultFeature1 = feature1;
          resultFeature2 = feature2;
        }
      }
      const feature = new GeoJSON.Feature("LineString");
      feature.geometry.coordinates = [resultFeature1.geometry.coordinates, resultFeature2.geometry.coordinates];
      feature.properties.distance = minDistance;
      distanceGeojson.features.push(feature);
    }
    const newLayer = {
      id: GeoJSON._uuidv4(),
      metadata: {
        title: 'Berekende afstanden'
      },
      type: "line",
      source : {
        type: "geojson",
        data: distanceGeojson
      },
      paint: {
        "line-color": "black",
        "line-width": 1
      }
    }
    this.dispatchEvent(new CustomEvent('addlayer', {
      detail: newLayer,
      bubbles: true,
      composed: true
    }));
  }
  _handleClick(e) {
    if (!this.buttonEnabled) {
      return;
    }
    const selections = this.shadowRoot.querySelectorAll('select');
    if (selections.length == 2) {
      const layer1id = selections[0].value;
      const layer2id = selections[1].value;
      this._calculateDistancess(layer1id, layer2id);
    }
  }
}
customElements.define('map-datatool-distance', MapDataToolDistance);
