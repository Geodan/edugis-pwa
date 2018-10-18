import {layersIcon} from './my-icons';
import './map-legend-item.js';
import GroupedArray from '../../lib/groupedarray';

import {LitElement, html} from '@polymer/lit-element';

/**
* @polymer
* @extends HTMLElement
*/
class MapLegendContainer extends LitElement {
  static get properties() { 
    return { 
      layerlist: Array,
      legendtitle: String,
      visible: Boolean,
      opened: Boolean,
      zoom: Number
    }; 
  }
  constructor() {
      super();
      this.groupedArray = new GroupedArray(["source", "source-layer"]);
      // properties
      this.layerlist = []
      this.visible = false;
      this.opened = false;
      this.legendtitle = "Kaartlagen en legenda's";
      this.zoom = 0;
  }
  compareItems(item1, item2) {
    if (item1._ga_group && item2._ga_group) {
        // compare groups
        return (item1.source === item2.source && item1['source-layer'] === item2['source-layer']);
    } else {
        // compare layers
        return (item1.id === item2.id);
    }
  }
  syncNewItemWithOldItems(newIndex, oldItems) {
    const newItem = this.groupedArray._items[newIndex];
    if (newItem._ga_group) {
        const oldGroupIndex = oldItems.findIndex((oldItem, oldIndex, oldItems)=>{
            if (oldItem._ga_group && (oldItem.source === newItem.source) && (oldItem['source-layer'] === newItem['source-layer']))
             {
                // same group source and group source-layer
                if (oldIndex > 0 && newIndex > 0) {
                    // check if first item in in group is the same
                    const firstOldItemInGroup = oldItems[oldIndex - 1];
                    const firstNewItemInGroup = this.groupedArray._items[newIndex - 1];
                    if (this.compareItems(firstOldItemInGroup, firstNewItemInGroup)) {
                        // same first item in both groups
                        return true;
                    } else {
                        // groups do not have same first item, check if they have the same last item
                        const groupSource = newItem.source;
                        const groupSourceLayer = newItem['source-layer'];
                        for (oldIndex--; 
                                oldIndex > -1 && oldItems[oldIndex].source===groupSource && oldItems[oldIndex]['source-layer']==groupSourceLayer; 
                                    oldIndex--) {                                            
                        }
                        const lastOldItemInGroup = oldItems[oldIndex + 1];
                        let localNewIndex = newIndex - 1;
                        for (;
                                localNewIndex > -1 && this.groupedArray._items[localNewIndex].source===groupSource && this.groupedArray._items[localNewIndex]['source-layer']==groupSourceLayer; 
                                    localNewIndex--) { 
                        }
                        const lastNewItemInGroup = this.groupedArray._items[localNewIndex + 1];
                        return this.compareItems(lastOldItemInGroup, lastNewItemInGroup);
                    }
                }
            }
            return false;
        });
        if (oldGroupIndex > -1) {
            // group found in oldItems
            newItem._ga_open = oldItems[oldGroupIndex]._ga_open;
            newItem._ga_visible = oldItems[oldGroupIndex]._ga_visible;
            newItem.slidervisible = oldItems[oldGroupIndex].slidervisible;
            newItem.legendvisible = oldItems[oldGroupIndex].legendvisible;
            newItem.layeropacity = oldItems[oldGroupIndex].layeropacity;
        }
    } else {
        const oldItem = oldItems.find(oldItem=>oldItem.id == newItem.id);
        if (oldItem) {
          newItem._ga_visible = oldItem._ga_visible;
          newItem._ga_open = oldItem._ga_open;
          newItem.slidervisible = oldItem.slidervisible;
          newItem.legendvisible = oldItem.legendvisible;
          newItem.layeropacity = oldItem.layeropacity;
        }
    }
  }
  updateGroupItems()
  {
      // set group layervisible to match item.layervisible, set item _ga_visible according to group open/close
      let i = 0;
      for (i = 0; i < this.groupedArray._items.length; i++) {
          const item = this.groupedArray._items[i];
          if (item._ga_group) {
            this.groupedArray.updateGroupOpen(item, item._ga_open);
            const hasVisibleLayer = this.groupedArray.getAllItemsInGroup(item._ga_id).findIndex(item=>item.layervisible);
            item.layervisible = hasVisibleLayer > -1;
          }
      }
  }
  updateGroupedList(newLayerlist, oldLayerlist)
  {
      const oldItems = this.groupedArray._items;
      this.groupedArray.items = newLayerlist.filter(item=>!item.id.startsWith('map-measure-')&&!item.id.startsWith('gl-draw-'))
        .map(item=>{
            item.layervisible=(item.hasOwnProperty('layout')?(item.layout.visibility!=='none'):true);
            return item;
        });
      this.groupedArray.reset();
      if (oldItems && oldItems.length > 0) {
        // set new item properties to old item properties
        for (let newIndex = 0; newIndex < this.groupedArray._items.length; newIndex++) {
            this.syncNewItemWithOldItems(newIndex, oldItems);
        }
      }
      this.updateGroupItems();
      this.requestUpdate();
  }
  shouldUpdate(changedProps) {
      const prevLayerList = changedProps.get('layerlist');
      if (this.layerlist) {
          this.updateGroupedList(this.layerlist, prevLayerList);
      }
      return (this.visible);
  }
  render() {
    /* see https://codepen.io/sulfurious/pen/eWPBjY?editors=1100 for flex layout */
    this.itemList = this.groupedArray.items.
        filter(item=>item._ga_visible&&!(item.type==="background")).reverse();
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
    </style>
    <div class="container${this.opened? '' : ' hidden'}">
        <div class="legendheader">
            ${this.legendtitle}
        </div>
        <div class="itemscroller">
            <div id="draggableitems">
                ${this.itemList.map(item=>
                    html`<map-legend-item .item="${item}"
                        .itemcontainer="${this.shadowRoot.querySelector('#draggableitems')}"
                        .itemscroller="${this.shadowRoot.querySelector('.itemscroller')}"
                        itemid="${item._ga_id}"
                        .layervisible="${item.layervisible}"
                        .slidervisible="${item.slidervisible?true:false}"
                        .legendvisible="${item.legendvisible?true:false}"
                        .legendurl="${item.metadata && item.metadata.legendurl?item.metadata.legendurl:''}"
                        .layeropacity="${item.layeropacity?item.layeropacity*100:100}"
                        .open="${item.hasOwnProperty('_ga_open')?item._ga_open:false}"
                        .zoom="${this.zoom}"
                        @openclose="${e=>this.openClose(e)}",
                        @litdragend="${e=>this.litDragEnd(e)}",
                        @updatevisibility="${e=>this.updateVisibility(e)}"
                        @updateopacity="${e=>this.updateOpacity(e)}"
                        @slidervisible="${e=>this.updateSliderVisible(e)}"
                        @legendvisible="${e=>this.updateLegendVisible(e)}"
                    ></map-legend-item>`)}
            </div>
            <div class="legendfooter">
                ${this.groupedArray.items.filter(item=>item._ga_visible&&(item.type==="background")).map(item=>
                    html`<map-legend-item .item="${item}" .layervisible="${item.layervisible}" isbackground="true"></map-legend-item>`)}
            </div>
        </div>
    </div>
    <div class="button" .title="${this.legendtitle}" @click="${e=>this.opened=!this.opened}">${layersIcon}</div>`;
    return result;
  }
  openClose(e) {
      const item = {_ga_id: e.detail._ga_id};
      if (e.detail.open) {
        this.groupedArray.openGroup(item);
      } else {
        this.groupedArray.closeGroup(item);
      }
      this.requestUpdate();
  }
  updateSliderVisible(e) {
      const index = this.groupedArray._items.findIndex(item=>item._ga_id==e.detail._ga_id);
      if (index > -1) {
        this.groupedArray._items[index].slidervisible = e.detail.slidervisible;
      }
      this.requestUpdate();
  }
  updateLegendVisible(e) {
    const index = this.groupedArray._items.findIndex(item=>item._ga_id==e.detail._ga_id);
    if (index > -1) {
      this.groupedArray._items[index].legendvisible = e.detail.legendvisible;
    }
    this.requestUpdate();
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
                                detail: {
                                    layer: sourceItem.id, 
                                    layers: this.groupedArray.getAllItemsInGroup(sourceItemId).map(item=>item.id), 
                                    beforeLayer: targetItem.id, 
                                    beforeFirst: e.detail.beforeFirst
                                }
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
        e.detail.layerid = this.groupedArray.getAllItemsInGroup(item._ga_id)
            .map(groupitem=>groupitem.id);
        this.requestUpdate();
      } 
  }
  updateOpacity(e) {
      // modify event that is bubbling up
      const item = this.groupedArray.getItem(e.detail._ga_id);
      item.layeropacity = e.detail.opacity;
      if (item._ga_group) {
        // toggle group visibility
        e.detail.layerid = this.groupedArray.getAllItemsInGroup(item._ga_id)
            .map(groupitem=>groupitem.id);
      }
  }
}

customElements.define('map-legend-container', MapLegendContainer);