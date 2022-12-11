import {LitElement, html, css} from 'lit';
import rootUrl from '../utils/rooturl';

/**
* @polymer
* @extends HTMLElement
*/
class MapInfoFormatted extends LitElement {
  static get properties() { 
    return { 
      active: Boolean,
      streetViewOn: Boolean,
      info: Array
    }; 
  }
  static get styles() {
    return css`
    .header {font-weight: bold; height: 1.5em; }
    .content { height: calc(100% - 1.5em); overflow: auto; font-size: 12px; }
    .streetviewcontainer {display: flex; flex-direction:row;  justify-content: flex-end;  }
    .layer {
      text-align: left;
      font-weight: bold;
      margin-top: 2px;
      background-color: lightgray;
    }
    .attributename {
      width: 90%;
      text-align: left;
      font-style: bold;
    }
    .attributevalue {
      width: 90%;
      text-align: left;
    }
    .attributetable {
      width: 100%;
      border-collapse: collapse;
    }
    tr.even {background: #f0f0f0;}
    td {width:50%;}
    .attributevalue .clickImage {cursor: pointer;}
  `}
  
  constructor() {
      super();
      this.info = [];
      this.filteredInfo = [];
      this.active = false;
      this.streetViewOn = false;
  }
  toggleStreetView(e)
  {
    this.streetViewOn = !this.streetViewOn;
    this.dispatchEvent(
      new CustomEvent('togglestreetview',
        {
            detail: {streetview: this.streetViewOn},
        })
    );
  }
  shouldUpdate(changedProps) {
    if (changedProps.has('active')) {
      this.dispatchEvent(new CustomEvent("infomode", {
        detail: this.active,
        bubbles: true,
        composed: true
      }))
    }
    return this.active;
  }
  render() {
    if (!this.active) {
      return html``;
    }
    let layerMap = new Map();
    return html`
      <style>
        .check-on {display: inline-block; width: 20px; height: 20px; vertical-align: middle; background: url('${rootUrl}images/checkradio.png') 20px 20px; }
        .check-off { display: inline-block; width: 20px; height: 20px; vertical-align: middle; background: url('${rootUrl}images/checkradio.png') 20px 0px; }
      </style>
      <div class="header">Informatie uit de kaart</div>
      <div class="content">
      <div class="streetviewcontainer">
      <div @click="${e=>this.toggleStreetView(e)}">
        <span>StreetView</span><div class="${this.streetViewOn?'check-on':'check-off'}"></div>
      </div>
      </div>
      ${this.info.length == 0? 'Klik op een element in de kaart voor informatie over dat element':''}
      <table class="attributetable">
      ${this.info.filter(feature=>(feature.layer.layout && feature.layer.layout.visibility && feature.layer.layout.visibility === 'none') ||  (feature.layer.metadata && feature.layer.metadata.reference)?false:true)
        .filter(feature=>{ // filter muliple features from same layer
          if (feature.layer && feature.layer.id) {
            if (layerMap.has(feature.layer.id)) {
              let featureCount = layerMap.get(feature.layer.id);
              const maxFeaturesPerLayer = feature.layer.metadata && feature.layer.metadata.maxinfofeatures ? feature.layer.metadata.maxinfofeatures : 1;
              if (featureCount < maxFeaturesPerLayer) {
                layerMap.set(feature.layer.id, featureCount + 1);
                return true;
              }
              return false;
            }
            layerMap.set(feature.layer.id, 1);
          }
          return true;
        })
        .map(feature=>
        html`
            <tr><td colspan="2"><div class="layer">${feature.layer.metadata?feature.layer.metadata.title?feature.layer.metadata.title:feature.layer.id:feature.layer.id}</div></td></tr>
            ${this.renderAttributes(feature)}
          `
      )}
      </table>
      </div>
    `;
  }
  renderAttributes(feature) {
    if (Object.keys(feature.properties).length === 0) {
      return html`<tr><div class="attributevalue">geen info beschikbaar op deze locatie</div></tr>`
    }
    let result = [];
    let odd = false;
    
    if (feature.layer && feature.layer.metadata && feature.layer.metadata.attributes) {
      let attributes = feature.layer.metadata.attributes;
      // add attributes/properties with translations
      if (attributes.translations) {
        for (let translation of attributes.translations) {
          if (translation.name) {
            if (attributes.deniedattributes && attributes.deniedattributes.indexOf(translation.name) > -1) {
              continue; // skip deniedattribute
            }
            if (attributes.allowedattributes && attributes.allowedattributes.indexOf(translation.name) === -1) {
              continue; // skip attribute not in allowedattributes
            }
            if (feature.properties[translation.name] || feature.properties[translation.name] === 0) {
              let value = feature.properties[translation.name];
              if (translation.valuemap && Array.isArray(translation.valuemap)) {
                const valueMap = translation.valuemap.find(valueMap=>Array.isArray(valueMap) && valueMap.length > 1 && valueMap[0] == value);
                if (valueMap) {
                  value = valueMap[1];
                }
              }
              if (translation.hasOwnProperty('decimals') && !isNaN(parseInt(translation.decimals))) {
                if (typeof parseFloat(value) == "number" && !isNaN(parseFloat(value))) {
                  let factor = Math.pow(10, parseInt(translation.decimals));
                  value = parseInt(Math.round(parseFloat(value) * factor)) / factor;
                }
              }
              if (translation.unit && translation.unit !== "" && !isNaN(parseInt(value))) {
                value += translation.unit;
              }
              let translatedKey = translation.translation ? translation.translation: translation.name;
              result.push(this.renderAttribute(translatedKey, value, odd=!odd));
            }
          }
        }
      }
      // now add attributes/properties without translations
      for (let key in feature.properties) {
        if (attributes.deniedattributes && attributes.deniedattributes.indexOf(key) > -1) {
          continue; // skip deniedattribute
        }
        if (attributes.allowedattributes && attributes.allowedattributes.indexOf(key) === -1) {
          continue; // skip attribute not in allowedattributes
        }
        if (attributes.translations && attributes.translations.findIndex(translation=>translation.name === key) > -1) {
          continue; // skip translated attributes
        }
        result.push(this.renderAttribute(key, feature.properties[key], odd=!odd));
      }
    } else {
      for (let key in feature.properties) {
        result.push(this.renderAttribute(key, feature.properties[key], odd=!odd));
      }
    }
    return result;
  }
  renderAttribute(key, value, odd) {
    let lowCaseValue = typeof value === 'string'? value.toLowerCase() : '';
    let isImage = (
      lowCaseValue.startsWith('https://maps.googleapis.com') || 
        (
          (lowCaseValue.startsWith('https://') || lowCaseValue.startsWith('https://')) && 
          (lowCaseValue.toLowerCase().endsWith('.png') || lowCaseValue.endsWith('.jpg')  || lowCaseValue.endsWith('.gif') || lowCaseValue.endsWith('.svg'))
        )
      );
    return html`<tr class=${odd?'':"even"}><td><div class="attributename">${key}</div></td>
    <td><div class="attributevalue">${typeof value === 'object' && value !== null?
          JSON.stringify(value)
        :isImage?html`<img class="clickImage" src="${value}" width="95%" @click="${e=>this._imageClicked(e)}">`:value}</div></td></tr>`
  }
  _imageClicked(event) {
    const imageUrl = event.target.src;
    if (imageUrl.startsWith('https://maps.googleapis.com')) {
      const streetViewLayer = this.info.filter(infoItem=>infoItem.layer.id === 'streetview');
      if (streetViewLayer.length) {
        const props = streetViewLayer[0].properties;
        // https://stackoverflow.com/questions/387942/google-street-view-url
        const streetViewUrl = `https://maps.google.com/maps?q=&layer=c&cbll=${props.latitude},${props.longitude}&cbp=11,0,0,0,0`
        this.dispatchEvent(new CustomEvent('showmodaldialog', {
          bubbles: true,
          composed: true,
          detail: {
            markdown: `[![Afbeelding](${imageUrl})](${streetViewUrl})`
          }
        }))
      }
      return;
    }
    this.dispatchEvent(new CustomEvent('showmodaldialog', {
      bubbles: true,
      composed: true,
      detail: {
        markdown: `![Afbeelding](${event.target.src})`
      }
    }))
  }
}

customElements.define('map-info-formatted', MapInfoFormatted);
