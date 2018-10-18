
import {LitElement, html} from '@polymer/lit-element';

/**
* @polymer
* @extends HTMLElement
*/
class MapInfoFormatted extends LitElement {
  static get properties() { 
    return { 
      info: Array
    }; 
  }
  constructor() {
      super();
      this.info = [];
  }
  render() {
    let result = html`
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
    console.log(result);
    return result;
  }
}
customElements.define('map-info-formatted', MapInfoFormatted);
