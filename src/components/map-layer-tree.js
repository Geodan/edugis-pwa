import {LitElement, html} from '@polymer/lit-element';

/* This component renders a tree of nodes as a collapsible tree
   leaf nodes can be selected with checkbox or radio-boxes
   Nodes are expected to be structured as follows
   [{title:"group", opened: false, type: "check|radio", subnodes: []}, {title:"title2", itemid: "id"}]
*/
/**
* @polymer
* @extends HTMLElement
*/
class MapLayerTree extends LitElement {
  static get properties() { 
    return { 
      nodelist: Array,
      updates: Number
    }; 
  }
  constructor() {
      super();
      this.nodelist = [];
      this.updates = 0;
  }
  toggleOpen(e, node) {
    if (node.opened) {
      node.opened = false;
    } else {
      node.opened = true;
    }
    e.stopPropagation();
    this.updates++;
  }
  toggleCheck(id) {
    this.toggleNodeInList(this.nodelist, id, false);
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
        this.updates++;
      } else {
        if (item.sublayers) {
          this.toggleNodeInList(item.sublayers, id, item.type === "radio");
        }
      }
    })
  }
  handleClick(e, node) {
    const input = e.currentTarget.querySelector("div");        
    if (input) {
      const id = input.getAttribute("id");
      this.toggleCheck(id);    
      e.stopPropagation();
    }
  }
  renderTree(nodeList, opened, radio, groupname) {
    return html`
      <ul class="${opened?'':'closed'}">${nodeList.map(node=>{
        if (node.sublayers){
          return html`<li @click="${e=>this.toggleOpen(e, node)}">
            ${node.title}
            <span class="${node.opened?'arrow-down opened':'arrow-down'}"></span>
            ${this.renderTree(node.sublayers, node.opened, node.type === "radio", node.id)}</li>`
        } else {
          return html`<li class="data" @click="${(e)=>{this.handleClick(e, node)}}">
            <div class="${radio?(node.checked?'radio-on':'radio-off'):(node.checked?'check-on':'check-off')}" name="${radio?groupname:node.id}" value="${node.id}" id="${node.id}"></div>
            <span class="label">${node.title}</span>
          </li>`;
        }
    })}</ul>`;
  }
  render() {
    return html`<style>
      ul {
        list-style-type: none;
        padding-left: 10px;
      }
      li {
        border-bottom: 1px solid gray;
        cursor: pointer;
        line-height: 1.8em;
      }
      li:last-child {
        border-bottom: none;
      }
      .arrow-down {
        border-style: solid;
        border-width: 1px 1px 0 0;
        content: '';
        display: inline-block;
        height: 8px;
        position: absolute;
        right: 20px;
        left: auto;
        -ms-transform: rotate(45deg);
        -webkit-transform: rotate(45deg);
        transform: rotate(45deg);
        margin-top: 4px;
        vertical-align: top;
        width: 8px;
        border-color: #555;
      }
      .opened {
        transform: rotate(133deg);
      }
      .closed {
        display: none;
      }
      .radio-on {
        display: inline-block;
        width: 20px;
        height: 20px;
        vertical-align: middle;
        background: url('${this.baseURI}/images/checkradio.png') 0 0;
      }
      .radio-off {
        display: inline-block;
        width: 20px;
        height: 20px;
        vertical-align: middle;
        background: url('${this.baseURI}/images/checkradio.png') 0 20px;
      }
      .check-on {
        display: inline-block;
        width: 20px;
        height: 20px;
        vertical-align: middle;
        background: url('${this.baseURI}/images/checkradio.png') 20px 20px;
      }
      .check-off {
        display: inline-block;
        width: 20px;
        height: 20px;
        vertical-align: middle;
        background: url('${this.baseURI}/images/checkradio.png') 20px 0px;
      }
      .label {
        vertical-align: middle;
      }
    </style>
    ${this.renderTree(this.nodelist, true)}`;
  }
}
customElements.define('map-layer-tree', MapLayerTree);
