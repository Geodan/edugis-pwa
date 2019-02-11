
import {LitElement, html} from '@polymer/lit-element';

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
    return this.active;
  }
  render() {
    if (!this.active) {
      return html``;
    }
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
      <div class="header">Informatie</div>
      <div class="content">
      <div class="streetviewcontainer">
      <div @click="${e=>this.toggleStreetView(e)}">
        <span>StreetView</span><div class="${this.streetViewOn?'check-on':'check-off'}"></div>
      </div>
      </div>
      ${this.info.filter(feature=>feature.layer.metadata?!feature.layer.metadata.reference:true).map(feature=>
        html`
          <div>
            <div class="layer">${feature.layer.metadata?feature.layer.metadata.title?feature.layer.metadata.title:feature.layer.id:feature.layer.id}</div>
            ${Object.keys(feature.properties).length?
              Object.keys(feature.properties).map(key=>
              html`<div class="attributename">${key}</div>
                  <div class="attributevalue">${typeof feature.properties[key] === 'object' && feature.properties[key] !== null?
                        JSON.stringify(feature.properties[key])
                      :typeof feature.properties[key] === 'string' && feature.properties[key].startsWith('https://maps.googleapis.com')?
                          html`<img src="${feature.properties[key]}">`
                        :feature.properties[key]}</div>`
              )
            : html`<div class="attributevalue">geen info</div>`}
          </div>`
      )}
      </div>
    `;
  }
}
customElements.define('map-info-formatted', MapInfoFormatted);
