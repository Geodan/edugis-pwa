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
  handleClick(e, node) {
    let input;
    switch (e.target.tagName) {
      case "LI":
        input = e.target.querySelector("input");
        if (input && input.type) {
          if (input.type == "radio") {
            input.checked = true;
          } else {
            input.checked = !input.checked;
          }
        }
        break;
      case "LABEL":
        input = e.target.parentNode.querySelector("input");
        break;
      case "INPUT":
        input = e.target;
        break;
    }
    if (input) {
      node.checked = input.checked;
    }
    e.stopPropagation();
  }
  renderTree(nodeList, opened, radio, groupname) {
    return html`<ul class="${opened?'':'closed'}">${nodeList.map(node=>{
        if (node.sublayers){
          return html`<li @click="${e=>this.toggleOpen(e, node)}">${node.title}<span class="${node.opened?'arrow-down opened':'arrow-down'}"></span>${this.renderTree(node.sublayers, node.opened, node.type === "radio", node.id)}</li>`
        } else {
          return html`<li class="data" @click="${(e)=>{this.handleClick(e, node)}}"><input ?checked="${node.checked}" name="${radio?groupname:node.id}" type="${radio?'radio':'checkbox'}" value="${node.id}" id="${node.id}"><label for="${node.id}">${node.title}</label></li>`;
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
        </style>
    </style>
    ${this.renderTree(this.nodelist, true)}`;
  }
}
customElements.define('map-layer-tree', MapLayerTree);
