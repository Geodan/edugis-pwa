
import {LitElement, html} from 'lit-element';

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
    let layerSet = new Set();
    return html`
      <style>
        .header {
          font-weight: bold;
          height: 1.5em;
        }
        .content {
          height: calc(100% - 1.5em);
          overflow: auto;
          font-size: 12px;
        }
        .check-on {
        display: inline-block;
        width: 20px;
        height: 20px;
        vertical-align: middle;
        background: url('${document.baseURI}/images/checkradio.png') 20px 20px;
      }
      .check-off {
        display: inline-block;
        width: 20px;
        height: 20px;
        vertical-align: middle;
        background: url('${document.baseURI}/images/checkradio.png') 20px 0px;
      }
      .streetviewcontainer {
        display: flex;
        flex-direction:row;
        justify-content: flex-end;
      }
      .layer {
        text-align: center;
        font-weight: bold;
        border-top: 1px solid lightgray;
      }
      .attributename {
        width: 90%;
        text-align: center;
        font-style: italic;
      }
      .attributevalue {
        width: 90%;
        text-align: center;
        border-bottom: 1px solid lightgray;
      }
      </style>
      <div class="header">Informatie uit de kaart</div>
      <div class="content">
      <div class="streetviewcontainer">
      <div @click="${e=>this.toggleStreetView(e)}">
        <span>StreetView</span><div class="${this.streetViewOn?'check-on':'check-off'}"></div>
      </div>
      </div>
      ${this.info.length == 0? 'Klik op een element in de kaart voor informatie over dat element':''}
      ${this.info.filter(feature=>feature.layer.metadata?!feature.layer.metadata.reference:true)
        .filter(feature=>{ // filter muliple features from same layer
          if (feature.layer && feature.layer.id) {
            if (layerSet.has(feature.layer.id)) {
              return false;
            }
            layerSet.add(feature.layer.id);
          }
          return true;
        })
        .map(feature=>
        html`
          <div>
            <div class="layer">${feature.layer.metadata?feature.layer.metadata.title?feature.layer.metadata.title:feature.layer.id:feature.layer.id}</div>
            ${this.renderAttributes(feature)}
          </div>`
      )}
      </div>
    `;
  }
  renderAttributes(feature) {
    if (feature.properties.length === 0) {
      return html`<div class="attributevalue">geen info beschikbaar op deze locatie</div>`
    }
    let result = [];
    Object.keys(feature.properties).forEach(key=>{
      let translatedKey = key;
      let value = feature.properties[key];  
      if (feature.layer && feature.layer.metadata && feature.layer.metadata.attributes) {
        let attributes = feature.layer.metadata.attributes
        if (attributes.deniedattributes) {
          if (attributes.deniedattributes.indexOf(key) > -1) {
            return;
          }
        }
        if (attributes.allowedattributes) {
          if (attributes.allowedattributes.indexOf(key) === -1) {
            return;
          }
        }
        if (attributes.translations) {
          for (let translation of attributes.translations) {
            if (translation.name === key) {
              if (translation.translation) {
                translatedKey = translation.translation;
              }
              if (translation.unit && translation.unit !== "") {
                value += translation.unit;
              }
            }
          }
        }
      }
      result.push(this.renderAttribute(translatedKey, value));
    })
    return result;
  }
  renderAttribute(key, value) {
    let isImage = (typeof value === 'string') && 
      (value.startsWith('https://maps.googleapis.com') || 
        (
          (value.startsWith('https://') || value.startsWith('https://')) && 
          (value.endsWith('.png') || value.endsWith('.jpg')  || value.endsWith('.gif') || value.endsWith('.svg'))
        )
      );
    return html`<div class="attributename">${key}</div>
    <div class="attributevalue">${typeof value === 'object' && value !== null?
          JSON.stringify(value)
        :isImage?html`<img src="${value}" width="95%">`:value}</div>`
  }
}
customElements.define('map-info-formatted', MapInfoFormatted);
