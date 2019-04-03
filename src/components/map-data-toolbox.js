import {LitElement, html, svg, css} from 'lit-element';
import './map-iconbutton';
import './map-datatool-distance';

const dummyIcon = svg`<svg height="24" width="24" viewbox="0 0 24 24"><style>.normal{ font: bold 18px sans-serif;}</style><text x="4" y="16" class="normal">A</text></svg>`;

/**
* @polymer
* @extends HTMLElement
*/
class MapDataToolbox extends LitElement {
  static get properties() { 
    return {
      active: {type: Boolean},
      map: {type: Object},
      currentTool: {type: String}
    }; 
  }
  static get styles() {
    return css`
      .header {font-weight: bold;height: 1.5em;border-bottom: 1px solid lightgray; padding-bottom: 3px; margin-bottom: 6px;}
      .buttoncontainer {display:inline-block; width: 20px; height: 20px; border: 1px solid gray; border-radius:4px;padding:2px;fill:gray;}
      .buttonbar {max-height: 100px; overflow: auto; border: 1px solid black;}
      .tool {border-bottom: 1px dashed gray;}
      .tool:hover {background-color: lightgray;}
    `
  }
  constructor() {
      super();
      this.map = null;
      this.active = false;
      this.currentTool = "";
  }
  render() {
    if (!this.active) {
      return html``;
    }
    return html`
      <div class="drawcontainer" @dragover="${e=>e.preventDefault()}" @drop="${(e)=>this._handleDrop(e)}">
        <div class="header">Gereedschapskist</div>
          <div class="buttonbar">
            <div class="tool">
              <div class="buttoncontainer">
                <map-iconbutton info="Afstanden" .icon=${dummyIcon} @click="${e=>this.currentTool='distancetool'}"></map-iconbutton>
              </div> 
              Afstandstool
            </div>
            <div class="tool">
            <div class="buttoncontainer">
              <map-iconbutton info="tool2" .icon=${dummyIcon} @click="${e=>this.currentTool='tool2'}"></map-iconbutton>
            </div> Tool2</div>
            <div class="tool">
            <div class="buttoncontainer">
              <map-iconbutton info="tool3" .icon=${dummyIcon} @click="${e=>this.currentTool='tool3'}"></map-iconbutton>
            </div> Tool3 </div>
            <div class="tool">
            <div class="buttoncontainer">
              <map-iconbutton info="tool4" .icon=${dummyIcon} @click="${e=>this.currentTool='tool4'}"></map-iconbutton>
            </div> Tool4 </div>
        </div>
        <div class="toolpanel">
          ${this._renderCurrentTool()}
        </div>
      </div>
    `
  }
  _renderCurrentTool() {
    switch (this.currentTool) {
      case "":
        return html`Kies combineergereedschap via de knoppen`;
      case "distancetool":
        return html`<map-datatool-distance .map=${this.map}></map-datatool-distance>`;
      default:
        return html`unhandled tool '${this.currentTool}'`;
    }
  }
}
customElements.define('map-data-toolbox', MapDataToolbox);
