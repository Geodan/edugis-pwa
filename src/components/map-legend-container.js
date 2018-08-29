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
      this.groupedArray.items = this.layerlist.filter(item=>!item.id.startsWith('map-measure-'))
        .map(item=>{
            item.layervisible=(item.hasOwnProperty('layout')?(item.layout.visibility==='visible'):true);
            return item;
        });
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
                <div id="draggableitems">
                    ${itemList.map(item=>
                        html`<map-legend-item item=${item} 
                            itemcontainer="${this.shadowRoot.querySelector('#draggableitems')}"
                            itemscroller="${this.shadowRoot.querySelector('.itemscroller')}"
                            itemid$="${item._ga_id}"
                            layervisible="${item.layervisible}"
                            open="${item.hasOwnProperty('_ga_open')?item._ga_open:false}"
                            on-openclose="${e=>this.openClose(e)}",
                            on-litdragend="${e=>this.litDragEnd(e)}",
                            on-updatevisibility="${e=>this.updateVisibility(e)}"
                        ></map-legend-item>`)}
                </div>
                <div class="legendfooter">
                    ${this.groupedArray.items.filter(item=>item._ga_visible&&(item.type==="background")).map(item=>
                        html`<map-legend-item item="${item}" layervisible="${item.layervisible}" isbackground="true"></map-legend-item>`)}
                </div>
            </div>
        </div>
    </div>
    <div class="button" title=${legendtitle} on-click="${e=>this.opened=!this.opened}">${layersIcon}</div>`;
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
  litDragEnd(e){
    if (e.detail.dragTarget) {
        let dragTarget = e.detail.dragTarget;
        if (dragTarget) {
            let sourceItemId = e.target.getAttribute('itemid');
            let targetItemId = dragTarget.getAttribute('itemid');
            if (sourceItemId && targetItemId && (sourceItemId !== targetItemId)) {
                const sourceItem = this.groupedArray.getItem(sourceItemId);
                const targetItem = this.groupedArray.getLastItemInGroup(targetItemId);
                if (sourceItem && targetItem) {
                    this.dispatchEvent(
                        new CustomEvent('movelayer',
                            {
                                detail: {layer: sourceItem.id, beforeLayer: targetItem.id}
                            }
                        )
                    );
                }
            }
        }
    }
  }
  updateVisibility(e) {
      // modify event that is bubbling up
      const item = this.groupedArray.getItem(e.detail._ga_id);
      if (item._ga_group) {
        // toggle group visibility
        e.detail.layerid = this.groupedArray.getAllItemsInGroup(item._ga_id).map(item=>item.id);
      } 
  }
}

customElements.define('map-legend-container', MapLegendContainer);