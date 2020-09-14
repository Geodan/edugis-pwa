import {LitElement, html} from 'lit-element';
import {foldercss} from './folder-icon.css.js';
import {getCapabilitiesNodes, copyMetadataToCapsNodes} from '../utils/capabilities';


/* This component renders a tree of nodes as a collapsible tree
   leaf nodes can be selected with checkbox or radio-boxes
   Nodes are expected to be structured as follows (only group-nodes have property "subnodes"):
   [{title:"group title", opened: true|false, type: "check|radio", subnodes: []}, {title:"title2", itemid: "id"}]
*/
/**
* @polymer
* @extends HTMLElement
*/
class MapLayerTree extends LitElement {
  static get properties() { 
    return { 
      nodelist: Array,
      maplayers: Array,
      updates: Number,
      headertext: String
    }; 
  }
  constructor() {
      super();
      this.nodelist = [];
      this.updates = 0;
      this.headertext = "headertext";
      this.maplayers = [];
  }
  updateChecked(nodeList, layerids)
  {
    nodeList.forEach(node=>{
      node.checked = layerids.has(node.layerInfo?node.layerInfo.id:node.id);
      if (node.sublayers) {
        this.updateChecked(node.sublayers, layerids);
      }
    });
  }
  shouldUpdate(changedProps) {
    if (changedProps.has("maplayers")) {
      const layerids = this.maplayers.reduce((result, layer)=>{
        if (layer.metadata && layer.metadata.styleid) {
          result.add(layer.metadata.styleid);
        } else {
          result.add(layer.id);
        }
        return result;
      }, new Set());
      // layerids now contains list of active map layers 
      this.updateChecked(this.nodelist, layerids)  
    }
    return true;
  }
  replaceNode(nodeList, nodeId)
  {
    const subNode = nodeList.find(node=>node.id==nodeId);
    if (subNode) {
      subNode.type = 'gettingcapabilities'; // prevent new replace while loading
      getCapabilitiesNodes(subNode.layerInfo)
        .then(newNodes=> {
          copyMetadataToCapsNodes(subNode.layerInfo, newNodes);
          for (let i = 0; i < nodeList.length; i++) {
            if (nodeList[i].id === nodeId) {                  
              nodeList.splice(i, 1, ...newNodes);
              //this.requestUpdate();
            }
          }
          this.requestUpdate();
        })  
        .catch(reason=>{
          subNode.title=`${nodeId}: ${reason}`;
          subNode.type='error';
          this.requestUpdate();
      });
    }
  }
  toggleOpen(e, node) {
    const list = e.currentTarget.querySelector('ul');
    const arrow = e.currentTarget.querySelector('.arrow-down');
    if (node.opened) {
      // close this list
      list.style.height = list.scrollHeight + 'px';
      arrow.classList.remove('opened');
      setTimeout(()=>list.style.height = 0, 100);
      setTimeout(()=>{
          node.opened = false;
          //list.classList.remove("open");
      }, 1000)
    } else {
      if (node.sublayers.find(node=>node.type==='getcapabilities')) {
        // sublayers has nodes of type 'getcapabilities', fetch capabilities and replace with result
        for (let i = 0; i < node.sublayers.length; i++) {
          if (node.sublayers[i].type === 'getcapabilities') {
            this.replaceNode(node.sublayers,node.sublayers[i].id);
          }
        }
      }
      // open this list
      list.style.height = 0;
      arrow.classList.add('opened');
      setTimeout(()=>list.style.height = list.scrollHeight + 'px', 100);
      setTimeout(()=>{
          list.style.height = 'auto';
          node.opened = true;
          //list.classList.add("open");
      }, 1000);
    }
    e.stopPropagation();
    //this.updates++;
  }
  isRadioNode(node) {
    if (node.type === "radio" || node.type === "reference") {
      return true;
    }
    if (node.sublayers && node.sublayers.length && node.sublayers[0].type === "reference") {
      return true;
    }
    return false;
  }
  toggleNodeInList(list, id, radio) {
    if (radio) {
      if (list.find(item=>item.id === id)) {
        list.forEach(item=>item.checked=false);
      }
    }
    list.forEach(item=>{
      if (item.id === id) {
        item.checked = !item.checked;
        this.dispatchEvent(new CustomEvent('toggleitem', 
          {detail: item}
        ));
        this.updates++;
      } else {
        if (item.sublayers) {
            this.toggleNodeInList(item.sublayers, id, this.isRadioNode(item));
        }
      }
    })
  }
  handleClick(e, node) {
    if (node.checked && this.isRadioNode(node)) {
      // should not toggle radio by clicking checked radio
      e.stopPropagation();
      return; 
    }
    const input = e.currentTarget.querySelector("div");        
    if (input) {
      const id = input.getAttribute("id");
      this.toggleNodeInList(this.nodelist, id, false);
      e.stopPropagation();
    }
  }
  renderTree(nodeList, opened, radio, groupname) {
    return html`
      <ul class="${opened?'open':''}">${nodeList.map(node=>{
        if (node.sublayers){
          return html`<li @click="${e=>this.toggleOpen(e, node)}">
            <div class="folder-icon"><div class="folder-tab"></div><div class="folder-sheet"></div></div> ${node.title}
            <span class="arrow-down${node.opened?' opened':''}"></span>
            ${this.renderTree(node.sublayers, node.opened, this.isRadioNode(node), node.id)}</li>`
        } else {
          if (opened && node.type === 'getcapabilities') {
              this.replaceNode(nodeList, node.id);
          }
          if (node.type === 'getcapabilities' || node.type === 'gettingcapabilities') {
            return html`<li><img src="${document.baseURI}/images/spinner.gif"> Loading...</li>`;
          }
          return html`<li class="data" @click="${(e)=>{this.handleClick(e, node)}}">
            <div class="${radio?(node.checked?'radio-on':'radio-off'):(node.checked?'check-on':'check-off')}" name="${radio?groupname:node.id}" value="${node.id}" id="${node.id}"></div>
            <span class="label">${node.title}</span>
          </li>`;
        }
    })}</ul>`;
  }
  render() {
    return html`${foldercss}
      <style>
      ul {
        list-style-type: none;
        padding-left: 10px;
        overflow: hidden;
        transition: height 0.5s ease-in-out;
        height: 0;
      }
      ul.open {
        height: auto;
      }
      li {
        border-bottom: 1px solid lightgray;
        cursor: pointer;
        line-height: 2.5em;
        position: relative;
      }
      li ul {
        cursor: default;
      }
      li:last-child {
        border-bottom: none;
      }
      .arrow-down {
        position: absolute;
        border-style: solid;
        border-width: 1px 1px 0 0;
        content: '';
        height: 8px;
        margin-right: 10px;
        left: auto;
        -ms-transform: rotate(45deg);
        -webkit-transform: rotate(45deg);
        transform: rotate(45deg);
        margin-top: 6px;
        vertical-align: top;
        width: 8px;
        right: 0px;
        border-color: #555;
        transition: transform .5s ease-in-out;
      }
      .opened {
        transform: rotate(133deg);
      }
      .radio-on {
        display: inline-block;
        width: 20px;
        height: 20px;
        vertical-align: middle;
        background: url('${document.baseURI}/images/checkradio.png') 0 0;
      }
      .radio-off {
        display: inline-block;
        width: 20px;
        height: 20px;
        vertical-align: middle;
        background: url('${document.baseURI}/images/checkradio.png') 0 20px;
      }
      .check-on {
        display: inline-block;
        width: 20px;
        height: 20px;
        vertical-align: middle;
        background: url('${document.baseURI}/images/checkradio.png') 20px 20px;
      }
      .check-off {
        display: inline-block;
        width: 20px;
        height: 20px;
        vertical-align: middle;
        background: url('${document.baseURI}/images/checkradio.png') 20px 0px;
      }
      .label {
        vertical-align: middle;
      }
      .title {
        font-weight: bold;
        position: relative;
        width: 100%;
        height: 30px;
        padding: 5px;
        border-bottom: 1px solid lightblue;
        box-sizing: border-box;
      }
      .wrapper {
        width: 100%;
        padding-right: 5%;
        height: calc(100% - 30px);
        font-size: 12px;
        overflow: auto;
        box-sizing: border-box;
      }
    </style>
    <div class="title">${this.headertext}</div>
    <div class="wrapper">
      <div>
        ${this.renderTree(this.nodelist, true, this.nodelist && this.nodelist.length && this.nodelist[0].type && this.nodelist[0].type==='reference')}
      </div>
    </div>`;
  }
}
customElements.define('map-layer-tree', MapLayerTree);
