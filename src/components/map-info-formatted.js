
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
        }
        .check-on {
        display: inline-block;
        width: 20px;
        height: 20px;
        vertical-align: middle;
        background: url('${this.baseURI}/images/checkradio.png') 20px 20px;
      }
      .check-off {
        display: inline-block;
        width: 20px;
        height: 20px;
        vertical-align: middle;
        background: url('${this.baseURI}/images/checkradio.png') 20px 0px;
      }
      .right {
        text-align: right;
        float: right;
        cursor: pointer;
        user-select: none;
      }
      </style>
      <div class="header">Informatie</div>
      <div class="content">
      <div class="right" @click="${e=>this.toggleStreetView(e)}">
        <span>StreetView</span><div class="${this.streetViewOn?'check-on':'check-off'}"></div>
      </div>
      ${this.info.filter(feature=>feature.layer.metadata?!feature.layer.metadata.reference:true).map(feature=>
        html`
          <table>
            <tr><th colspan="2" align="center">${feature.layer.id}</th></tr>
            ${Object.keys(feature.properties).length?
              Object.keys(feature.properties).map(key=>
                html`<tr><td align="right"><i>${key}</i>:</td><td>${typeof feature.properties[key] === 'object' && feature.properties[key] !== null?JSON.stringify(feature.properties[key]):feature.properties[key].startsWith('https://maps.googleapis.com')?html`<img src="${feature.properties[key]}">`:feature.properties[key]}</td></tr>`
              )
            : html`<tr><td colspan="2" align="center">geen info</td></tr>`}
          </table>`
      )}
      </div>
    `;
  }
}
customElements.define('map-info-formatted', MapInfoFormatted);
