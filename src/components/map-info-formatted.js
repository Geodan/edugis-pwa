
import {LitElement, html} from '@polymer/lit-element';

/**
* @polymer
* @extends HTMLElement
*/
class MapInfoFormatted extends LitElement {
  static get properties() { 
    return { 
      active: Boolean,
      info: Array
    }; 
  }
  constructor() {
      super();
      this.info = [];
      this.active = false;
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
      </style>
      <div class="header">Informatie</div>
      <div class="content">
      ${this.info.filter(feature=>feature.layer.metadata?!feature.layer.metadata.reference:true).map(feature=>
        html`
          <table>
            <tr><th colspan="2" align="center">${feature.layer.id}</th></tr>
            ${Object.keys(feature.properties).length?
              Object.keys(feature.properties).map(key=>
                html`<tr><td align="right"><i>${key}</i>:</td><td>${typeof feature.properties[key] === 'object' && feature.properties[key] !== null?JSON.stringify(feature.properties[key]):feature.properties[key]}</td></tr>`
              )
            : html`<tr><td colspan="2" align="center">geen info</td></tr>`}
          </table>`
      )}
      </div>
    `;
  }
}
customElements.define('map-info-formatted', MapInfoFormatted);
