import {LitElement, html} from '@polymer/lit-element';
import "./map-selected-layer-set";

/**
* @polymer
* @extends HTMLElement
*/
class MapSelectedLayers extends LitElement {
  static get properties() { 
    return { 
      active: {type: Boolean},
      layerlist: {type: Array, hasChanged: this.listChanged},
      zoom: {type: Number},
    }; 
  }
  constructor() {
      super();
      this.active = true;
      this.zoom = 0;
      this.layerlist = [];
      this.thematicLayers = [];
      this.referenceLayers = [];
  }
  listChanged(newList, oldList) {
    if (newList.length != oldList.length) {
      console.log('length changed!');
      return true;
    }
    for (let i = 0; i < newList.length; i++) {
      if (newList[i] !== oldList[i]) {
        console.log('element changed!');
        return true;
      }
    }
    return false;
  }
  shouldUpdate(changedProps) {
    if (changedProps.has('layerlist')) {
      this.thematicLayers = this.layerlist.filter(layer=>!layer.metadata || (layer.type !=='background' && layer.metadata && (!layer.metadata.reference))).reverse();
      this.referenceLayers = this.layerlist.filter(layer=>layer.metadata && layer.metadata.reference || layer.type==='background').reverse();
    }
    return this.active;
  }
  render() {
    return html`<style>
      .border {
        background-color: rgba(250,250,250,.87);
        padding: 10px;
      }
      .outercontainer {
        background-color: rgba(250,250,250);
        font-size: 12px;
        color: #555;
        fill: #777;
        margin: 0;
        padding: 10px;
        pointer-events: auto;
        display: flex;
        flex-direction: column;
        max-height: calc(100vh - 175px);
        overflow: auto;
      }
      .opener {
        border-bottom: 1px solid lightgray;
        cursor: pointer;
        line-height: 30px;
        vertical-align: middle;
      }
      .arrow-down {
        border-style: solid;
        border-width: 1.5px 1.5px 0 0;
        content: '';
        height: 8px;
        float: right;
        margin-left: 5px;
        left: auto;
        -ms-transform: rotate(45deg);
        -webkit-transform: rotate(45deg);
        transform: rotate(45deg);
        margin-top: 11px; /* (30 - 8)/2 */
        width: 8px;
        border-color: #555;
        transition: transform .5s linear;
      }
      .opened {
        transform: rotate(133deg);
      }
      .setcontainer {
        transition: height .5s ease-in-out;
        border-bottom: 1px solid lightgray;
        padding: 10px;
      }
      .closed {
        height: 0;
        padding: 0;
        overflow: hidden;
      }
    </style>
    <div class="border">
      <div class="outercontainer">
        <div class="opener" @click="${e=>this.toggleSetOpen(e)}">Geselecteerde thematische kaartlagen<span class="arrow-down opened"></span></div>
        <div class="setcontainer">
          <map-selected-layer-set .layerlist="${this.thematicLayers}" .zoom="${this.zoom}"></map-selected-layer-set>
        </div>
        <div class="opener" @click="${e=>this.toggleSetOpen(e)}">Geselecteerde achtergrondlagen<span class="arrow-down"></span></div>
        <div class="setcontainer closed">
          <map-selected-layer-set .layerlist="${this.referenceLayers}" .zoom="${this.zoom}"></map-selected-layer-set>
        </div>
      </div>
    </div>`;
  }
  toggleSetOpen(e) {
    const arrow = e.currentTarget.querySelector("span");
    arrow.classList.toggle("opened");
    const setContainer = e.currentTarget.nextElementSibling;
    if (setContainer.classList.contains('closed')) {
      // open the set
      setContainer.style.height = 0; 
      setTimeout(()=>setContainer.style.height=setContainer.scrollHeight + 'px', 100);
      setTimeout(()=>{
        setContainer.classList.remove('closed');
        setContainer.style.height = null;
      }, 600);
    } else {
      // close the set
      setContainer.style.height = setContainer.scrollHeight + 'px';
      setContainer.style.overflow = 'hidden';
      setTimeout(()=>setContainer.style.height = 0, 100);
      setTimeout(()=>{
        setContainer.classList.add('closed');
        setContainer.style.height = null;
        setContainer.style.overflow = null;
      }, 600);
    }
  }
}
customElements.define('map-selected-layers', MapSelectedLayers);
