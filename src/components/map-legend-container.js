import {layersIcon} from './my-icons';
import './map-legend-item.js';
import GroupedArray from '../../lib/groupedarray';

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
      this.groupedArray = new GroupedArray(["source", "source-layer"]);
      // properties
      this.layerlist = []
      this.visible = false;
      this.opened = false;
      this.legendtitle = "Kaartlagen en legenda's"
  }
  updateGroupedList()
  {
      this.groupedArray.items = this.layerlist.filter(item=>!item.id.startsWith('map-measure-'));
      this.groupedArray.reset();
      this.requestRender();
  }
  _shouldRender(props, changedProps, prevProps) {
      if (changedProps && changedProps.layerlist) {
          this.updateGroupedList();
      }
      return (props.visible);
  }
  _render({opened, legendtitle}) {
    /* see https://codepen.io/sulfurious/pen/eWPBjY?editors=1100 for flex layout */
    const itemList = this.groupedArray.items.filter(item=>item._ga_visible&&!(item.type==="background")).reverse();
    console.log(JSON.stringify(itemList));
    let htmlItemList = itemList.map(item=>
        html`<map-legend-item item=${item} 
            itemid$="${item._ga_id}" 
            open=${item.hasOwnProperty('_ga_open')?item._ga_open:false} 
            draggable="true"
            on-dragstart="${e=>this.dragStart(e)}"
            on-dragover="${e=>this.dragOver(e)}"
            on-dragleave="${e=>this.dragLeave(e)}"
            on-drop="${e=>this.dragDrop(e)}"
            on-dragend="${e=>this.dragEnd(e)}"
            on-openclose="${e=>this.openClose(e)}"
         ></map-legend-item>`);
    console.log(htmlItemList);
    let result = html`
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
            opacity: 0.75;
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
                    ${htmlItemList}
                </div>
                <div class="legendfooter">
                    ${this.groupedArray.items.filter(item=>item._ga_visible&&(item.type==="background")).map(item=>
                        html`<map-legend-item item=${item} isbackground="true"></map-legend-item>`)}
                </div>
            </div>
        </div>
    </div>
    <div class="button" title=${legendtitle} on-click="${e=>this.opened=!this.opened}">${layersIcon}</div>`;
    console.log(result.getHTML());
    return result;
  }
  _didRender() {
    ;
  }
  _firstRendered() {
    ;
  }
  openClose(e) {
      const item = {_ga_id: e.detail._ga_id};
      if (e.detail.open) {
        this.groupedArray.openGroup(item);
      } else {
        this.groupedArray.closeGroup(item);
      }
      this.requestRender();
  }
  //drag-drop based on https://stackoverflow.com/questions/44415228/list-sorting-with-html5-dragndrop-drop-above-or-below-depending-on-mouse
  dragStart(e) {
    this._el = e.target;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", this._el);
    e.target.classList.add('dragging');
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
  dragDrop(event) {
    /*event.preventDefault();*/
    let itemid = this._el.getAttribute('itemid');
    let beforeid = '';
    if (event.target.style['border-bottom'] !== '') {
        // insert below event.target
        event.target.style['border-bottom'] = '';
        beforeid = event.target.nextElementSibling.getAttribute('itemid');
        event.target.parentNode.insertBefore(this._el, event.target.nextElementSibling);
    } else {
        // insert before event.target
        event.target.style['border-top'] = '';
        beforeid = event.target.getAttribute('itemid');
        event.target.parentNode.insertBefore(this._el, event.target);
        
    }
    if (itemid == beforeid) {
        // item dropped onto itself, do nothing
        return;
    }
    const item = this.groupedArray.getItem(itemid);
    const beforeItem = this.groupedArray.getItem(beforeid);
    if (item.id && beforeItem.id) {
        this.dispatchEvent(
            new CustomEvent('movelayer',
                {
                    detail: {layer: item.id, beforeLayer: beforeItem.id}
                }
            )
        );
    }
  }
  dragEnd(event) {
      this._el.classList.remove("dragging");
  }
}

customElements.define('map-legend-container', MapLegendContainer);