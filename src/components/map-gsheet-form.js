import {LitElement, html} from 'lit-element';

/**
* @polymer
* @extends HTMLElement
*/
class MapGSheetForm extends LitElement {
  static get properties() { 
    return {
      layerinfo: Object      
    }; 
  }
  constructor() {
      super();
      this.sheetkey = "";
      this.mapurl = "";
  }
  sheetURL(sheetkey) {
    return "https://docs.google.com/spreadsheets/d/" + sheetkey
  }
  shouldUpdate() {
    return (this.layerinfo ? true : false);
  }
  extractKeyFromUrl(url) {
    url = url.replace('\\', '/');
    const parts = url.split('?')[0].split('/');
    let key = "";
    parts.forEach(element => {
      if (element.length > key.length) {
        key = element;
      }
    });
    return key;
  }
  linkSheetDataToGeoJson(geojson, linkproperty, sheetdata, sheetcolumn)
  {
    sheetcolumn = sheetcolumn.charCodeAt(0) - 65;
    const sheetproperty = sheetdata.values[0][1];
    geojson.features.forEach(feature=>{
      const geocode = feature.properties[linkproperty];
      let index = sheetdata.values.findIndex(element=>element[sheetcolumn]==geocode);
      if (index > -1) {
        feature.properties[sheetproperty] = parseFloat(sheetdata.values[index][1]);
      }
    });
    return geojson;
  }
  createLayerFromGeojson(geojson, attribute, attribution) {
    geojson.features = geojson.features.sort((feature1, feature2)=>feature1.properties[attribute]-feature2.properties[attribute]);
    const values = geojson.features
      .map(feature=>feature.properties[attribute])
      .filter(value=>value !== undefined)
      .sort((value1, value2)=>value1-value2);
    const title = this.layerinfo.metadata?this.layerinfo.metadata.title?this.layerinfo.metadata.title:this.layerinfo.id:this.layerinfo.id;
    const maplayer = {
      "id" : this.layerinfo.id,
      "type" : "fill",
      "metadata" : {
        "title": title
      },
      "source" : {
        "type": "geojson",
        "data": geojson,
        "attribution": attribution
      },
      "filter" : ["has", attribute],
      "paint": {
          "fill-color": [
            "step",
            ["get", attribute],
            "#fef0d9",
            parseFloat(values[Math.floor(values.length/5)]), "#fdcc8a",
            parseFloat(values[Math.floor(values.length*2/5)]),"#fc8d59",
            parseFloat(values[Math.floor(values.length*3/5)]),"#e34a33",
            parseFloat(values[Math.floor(values.length*4/5)]),"#b30000"
          ],
          "fill-outline-color": "#444"
      }
    }
    this.dispatchEvent(new CustomEvent('addlayer', 
        {detail: maplayer}
    ))
  }
  submitForm(e) {
    const layerinfo = {
      sheetkey : this.extractKeyFromUrl(this.shadowRoot.querySelector('#gsheeturl').value),
      mapurl : this.shadowRoot.querySelector('#mapurl').value,
      sheetcolumn : this.shadowRoot.querySelector('#sheetcolumn').value,
      datacolumn : this.shadowRoot.querySelector('#datacolumn').value
    }
    const sheetApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${layerinfo.sheetkey}/values/A:B?key=${APIkeys.google}`;
    fetch(sheetApiUrl).then(data=>data.json()).then(data=>{
      fetch(layerinfo.mapurl).then(json=>json.json()).then(geojson=>{
        this.linkSheetDataToGeoJson(geojson, layerinfo.datacolumn, data, layerinfo.sheetcolumn);
        this.createLayerFromGeojson(geojson, data.values[0][1], 'cbs');
        this.dispatchEvent(new CustomEvent('close', {bubbles: true}));
      }).catch(reason=>alert(`error (${layerinfo.mapurl}): ${reason}`))
    }).catch(reason=>alert(`error (${sheetApiUrl}): ${reason}`));
  }
  render() {
    const sheetkey = this.layerinfo.sheet.key;
    const mapurl = this.layerinfo.source.data;
    const sheetcolumn = this.layerinfo.sheet.sheetcolumn;
    const datacolumn = this.layerinfo.sheet.datacolumn;
    return html`
      <style>
      .gsheetform {
        cursor: pointer;
        padding: 4px;
      }
      #gsheeturl, #mapurl {
        width: 30em;
      }
      </style>
      <div class="gsheetform">
      <label for="gsheeturl">Sheet URL:</label><br/>
      <input type="text" name="gsheeturl" id="gsheeturl" value="${this.sheetURL(sheetkey)}">
      
      <p></p>
      <label for="mapurl">Kaartlaagdata URL:</label><br/>
      <input type="text" name="mapurl" id="mapurl" value="${mapurl}">
      <p></p>
      <label for="sheetcolumn">Sheet koppel-kolom:</label>
      <select name="sheetcolumn" id="sheetcolumn">
      ${new Array( 26 ).fill( 1 ).map( ( _, i ) => html`<option .selected="${sheetcolumn==String.fromCharCode(65+i)?'true':undefined}">${String.fromCharCode( 65 + i )}</option>`)}
      </select>
      <br/>
      <label for="datacolumn">Kaartlaagdata koppelattribuut:</label>
      <input type="text" name="datacolumn" id="datacolumn" value="${datacolumn}">
      <br/>
      <input type="button" value="OK" @click="${e=>this.submitForm()}">
      </div>
    `;
  }
}
customElements.define('map-gsheet-form', MapGSheetForm);
