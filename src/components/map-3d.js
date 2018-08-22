
import './map-iconbutton';

import {LitElement, html} from '@polymer/lit-element';
class Map3D extends LitElement {
  _render({webmap, visible}) {
    return html`<style>
        :host {
          position: absolute;
          right: 10px;
          top: 180px;          
        }
        .hidden {
          display: none;
        }
    </style>
    <map-iconbutton info="(re-)set pitch" icon="3D"></map-iconbutton>`;
  }
  
}
customElements.define('map-3d', Map3D);
