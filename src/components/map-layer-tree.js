import {LitElement, html} from '@polymer/lit-element';
import {foldercss} from './folder-icon.css.js';

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
        if (layer.metadata.styleid) {
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
  scaleHintToZoomLevel(hint)
  {
    for (let level = 0, calc = 110692.6408; level < 22; level++, calc /= 2.0) {
      if (hint > calc) {
        return level;
      }
    }
  }
  layerToNode(Layer, Request) {
    const node = { "title": Layer.Title, "id": Layer.Name, "type":"wms", "layerInfo": {
      "id" : Layer.Name,
      "type" : "raster",
      "metadata" : {
          "title" : Layer.Title,
          "legendurl": Layer.Style[0].LegendURL[0].OnlineResource,
          "getFeatureInfoUrl": Request.GetFeatureInfo.DCPType[0].HTTP.Get.OnlineResource + "service=WMS&version=1.1.1&request=GetFeatureInfo&layers=" + encodeURIComponent(Layer.Name) + "&query_layers=" + encodeURIComponent(Layer.Name)
      },
      "source" : {
          "type": "raster",
          "tileSize" : 256,
          "tiles": [
              Request.GetMap.DCPType[0].HTTP.Get.OnlineResource + "service=WMS&version=1.1.1&request=GetMap&layers=" + encodeURIComponent(Layer.Name) + "&SRS=EPSG:3857&transparent=true&format=image/png&BBOX={bbox-epsg-3857}&width=256&height=256&styles=" + encodeURIComponent(Layer.Style[0].Name)
          ],
          "attribution": Layer.Attribution && Layer.Attribution.Title ? Layer.Attribution.Title: ""
          }
      }
    }
    if (Layer.ScaleHint) {
      if (Layer.ScaleHint.max) {
        node.layerInfo.minzoom = this.scaleHintToZoomLevel(Layer.ScaleHint.max);
        node.layerInfo.source.minzoom = node.layerInfo.minzoom;
      }
      if (Layer.ScaleHint.min) {
        node.layerInfo.maxzoom = this.scaleHintToZoomLevel(Layer.ScaleHint.min);
        node.layerInfo.source.maxzoom = node.layerInfo.maxzoom;
      }
    }
    if (Layer.EX_GeographicBoundingBox) {
      node.layerInfo.source.bounds = Layer.EX_GeographicBoundingBox;      
    } else if (Layer.LatLonBoundingBox) {
      node.layerInfo.source.bounds = Layer.LatLonBoundingBox;
    } else if (Layer.BoundingBox) {
      const bbox4326 = Layer.BoundingBox.find(bbox=>bbox.crs==='EPSG:4326');
      if (bbox4326) {
        node.layerInfo.source.bounds = bbox4326.extent;
      }
      const bbox3857 = Layer.BoundingBox.find(bbox=>bbox.crs==='EPSG:3857' || bbox.crs==='EPSG:900913');
      if (bbox3857) {
        const forward = proj4(proj4.Proj("EPSG:3857"), proj4.WGS84).forward;
        node.layerInfo.source.bounds = [...forward(bbox3857.extent[0], bbox3857.extent[1]), ...forward(bbox3857.extent[2],bbox3857.extent[3])];
      }
    } 
    return node;
  }
  allowedLayer(Layer, deniedlayers, allowedlayers) {
    if (deniedlayers.length) {
      if (deniedlayers.find(layer=>layer === Layer.Name)) {
        return false;
      }
    }
    if (allowedlayers.length) {
      return (allowedlayers.find(layer=>layer === Layer.Name));
    }
    return true;
  }
  convertToArray(layerlist) {
    if (!layerlist) {
      return [];
    }
    if (Array.isArray(layerlist)){
      return layerlist;
    }
    return layerlist.split(',');
  }
  capabilitiesToCatalogNodes(xml, deniedlayers, allowedlayers) {
    const parser = new WMSCapabilities();
    const json = parser.parse(xml);
    const result = [];
    deniedlayers = this.convertToArray(deniedlayers);
    allowedlayers = this.convertToArray(allowedlayers);
    if (json.Capability.Layer.Name && json.Capability.Layer.Name !== '') {
      // non-empty root layer
      if (this.allowedLayer(json.Capability.Layer, deniedlayers, allowedlayers)) {
        result.push(this.layerToNode(json.Capability.Layer, json.Capability.Request));
      }
    }
    if (json.Capability.Layer.Layer && json.Capability.Layer.Layer.length) {
      // array of sublayers
      json.Capability.Layer.Layer.forEach(Layer=>{
        if (this.allowedLayer(Layer, deniedlayers, allowedlayers)) {
          result.push(this.layerToNode(Layer, json.Capability.Request));
        }
      })
    }
    return result;
  }
  replaceSubNode(parentNode, nodeId)
  {
    const subNode = parentNode.sublayers.find(node=>node.id==nodeId);
    if (subNode) {
      fetch(subNode.layerInfo.url).then(response=>{
        if (!response.ok) {
          throw Error(`${nodeId}: req rejected with status ${response.status} ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type');
        if (contentType) {
          if (contentType === 'application/vnd.ogc.wms_xml' || contentType.startsWith('text/xml')) { 
            // caps 1.1.1 or caps 1.3.0
            response.text().then(xml=>{
              const nodes = this.capabilitiesToCatalogNodes(xml, subNode.layerInfo.deniedlayers, subNode.layerInfo.allowedlayers);
              if (nodes.length == 0) {
                nodes.push({"title": `${nodeId}: 0 layers or failed`});
              }
              return nodes;
            })
            .then(newNodes=> {
              for (let i = 0; i < parentNode.sublayers.length; i++) {
                if (parentNode.sublayers[i].id === nodeId) {                  
                  parentNode.sublayers.splice(i, 1, ...newNodes);
                  this.requestUpdate();
                }
              }
            })
          }                
        }
      }).catch(reason=>{
        subNode.title=`${nodeId}: ${reason}`;
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
            this.replaceSubNode(node,node.sublayers[i].id);
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
  toggleCheck(id) {
    this.toggleNodeInList(this.nodelist, id, false);
  }
  isRadioNode(node) {
    if (node.type === "radio") {
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
    const input = e.currentTarget.querySelector("div");        
    if (input) {
      const id = input.getAttribute("id");
      this.toggleCheck(id);
      e.stopPropagation();
    }
  }
  renderTree(nodeList, opened, radio, groupname) {
    return html`
      <ul class="${opened?'open':''}">${nodeList.map(node=>{
        if (node.sublayers){
          return html`<li @click="${e=>this.toggleOpen(e, node)}">
            <div class="folder-icon"><div class="folder-tab"></div><div class="folder-sheet"></div></div> ${node.title}
            <span class="arrow-down"></span>
            ${this.renderTree(node.sublayers, node.opened, this.isRadioNode(node), node.id)}</li>`
        } else {
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
      }
      li:last-child {
        border-bottom: none;
      }
      .arrow-down {
        border-style: solid;
        border-width: 1px 1px 0 0;
        content: '';
        height: 8px;
        float: right;
        margin-right: 10px;
        left: auto;
        -ms-transform: rotate(45deg);
        -webkit-transform: rotate(45deg);
        transform: rotate(45deg);
        margin-top: 6px;
        vertical-align: top;
        width: 8px;
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
        text-align: center;
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
        ${this.renderTree(this.nodelist, true)}
      </div>
    </div>`;
  }
}
customElements.define('map-layer-tree', MapLayerTree);
