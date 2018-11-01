
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
      </style>
      <div>
      ${this.info.filter(feature=>feature.layer.metadata?!feature.layer.metadata.reference:true).map(feature=>
        html`
          <table>
            <tr><th cols="2" align="center">${feature.layer.id}</th></tr>
            ${Object.keys(feature.properties).map(key=>
              html`<tr><td align="right">${key}:</td><td>${feature.properties[key]}</td></tr>`
            )}
          </table>`
      )}
      </div>
    `;
  }
}
customElements.define('map-info-formatted', MapInfoFormatted);
