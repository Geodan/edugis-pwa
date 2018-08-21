import {layersIcon} from './my-icons';
import './map-legend-item.js';

import {LitElement, html} from '@polymer/lit-element';
class MapLegendContainer extends LitElement {
  static get properties() { 
    return { 
      layerlist: Array,
      legendtitle: String,
      visible: Boolean,
      opened: Boolean
    }; 
  }
  constructor() {
      super();
      // properties
      this.layerlist = []
      this.visible = false;
      this.opened = false;
      this.legendtitle = "Kaartlagen en legenda's"
  }
  _shouldRender(props, changedProps, prevProps) {
      return (props.visible);
  }
  _render({opened, layerlist, legendtitle}) {
    /* see https://codepen.io/sulfurious/pen/eWPBjY?editors=1100 for flex layout */
    return html`
    <style>
        .container {
            position: absolute;
            display: flex;
            flex-direction: column;
            right: 45px;
            bottom: 30px;
            box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
            border-radius: 4px;
            max-height: 90%;
            max-width: 400px;
            background-color:white;
        }
        .legendheader {
            font-weight:bold;
            font-size:1.17em;
            border-bottom:1px solid lightblue;
            box-sizing: border-box;
            padding: 5px;
        }
        .itemscroller {            
            overflow:auto;
            display: flex;
            flex: 1;
            box-sizing: content-box;
            min-height: 0px; /* IMPORTANT: you need this for non-chrome browsers */
        }
        .button {
            position: absolute;
            bottom: 30px;
            right: 10px;
            box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
            border-radius: 4px;
            height: 30px;
            width: 30px;
            padding: 3px;
            background-color: white;
            visibility: visible;
            box-sizing: border-box;
        }
        .button:hover {
            background-color: whitesmoke;
        }
        .hidden {
            visibility: hidden;
        }
        .dragging {
            opacity: 0.25;
            color: orange;
        }
    </style>
    <div class$="container${opened? '' : ' hidden'}">
        <div class="legendheader">
            ${legendtitle}
        </div>
        <div class="itemscroller">
            <div class="itemlist">
                <div>
                    ${layerlist.slice(1).reverse().filter(item=>!item.id.startsWith('map-measure-'))
                        .map(item=>
                            html`<map-legend-item layer=${item} draggable="true" on-dragstart="${e=>this.dragStart(e)}" on-dragover="${e=>this.dragOver(e)}" on-dragleave="${e=>this.dragLeave(e)}" on-drop="${e=>this.dragDrop(e)}" on-dragend="${e=>this.dragEnd(e)}"></map-legend-item>`)}
                </div>
                <div class="legendfooter">
                    ${layerlist.slice(0,1).map(item=>html`<map-legend-item layer=${item} isbackground="true"></map-legend-item>`)}
                </div>
            </div>
        </div>
    </div>
    <div class="button" title=${legendtitle} on-click="${e=>this.opened=!this.opened}">${layersIcon}</div>`
  }
  _didRender() {
    ;
  }
  _firstRendered() {
    ;
  }
  //drag-drop based on https://stackoverflow.com/questions/44415228/list-sorting-with-html5-dragndrop-drop-above-or-below-depending-on-mouse
  dragDrop(event) {
    event.preventDefault();
    if (event.target.style['border-bottom'] !== '') {
        event.target.style['border-bottom'] = '';
        event.target.parentNode.insertBefore(this._el, event.target.nextSibling);
    } else {
        event.target.style['border-top'] = '';
        event.target.parentNode.insertBefore(this._el, event.target);
    }
  }
  dragEnd(event) {
      this._el.classList.remove("dragging");
  }
  dragOver(event) {
    event.preventDefault();
    const bounding = event.target.getBoundingClientRect();
    const offset = bounding.y + (bounding.height/2);
    if (event.clientY - offset > 0) {
        event.target.style['border-bottom'] = 'solid 4px black';
        event.target.style['border-top'] = '';
    } else {
        event.target.style['border-bottom'] = '';
        event.target.style['border-top'] = 'solid 4px black';
    }
  }
  dragLeave(event) {
    event.target.style['border-bottom'] = '';
    event.target.style['border-top'] = '';
  }
  dragStart(e) {
    this._el = e.target;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", this._el);
    e.target.classList.add('dragging');
  }
}

customElements.define('map-legend-container', MapLegendContainer);