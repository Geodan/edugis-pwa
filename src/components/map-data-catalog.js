
import {LitElement, html} from '@polymer/lit-element';
class MapDataCatalog extends LitElement {
  static get properties() { 
    return { 
      datacatalog: Object
    }; 
  }
  constructor() {
    super();
    this.map = null;
    this.datacatalog = null;
  }
  /*_createRoot() {
    console.log('_createRoot()');
    return this;
  }*/
  _shouldRender(props, changedProps, prevProps) {
    return (props.datacatalog != null);
  }
  renderTree(nodeList) {
    return html`<ul>${nodeList.map(elem=>{
        if (elem.type=="group"){
            return html`<li>${elem.title}${this.renderTree(elem.sublayers)}</li>`
        } else {
            return html`<li class="data" on-click="${(e)=>{this.handleClick(e, (elem.layerInfo?elem.layerInfo.id:undefined), )}}">${elem.title}</li>`;
        }
    })}</ul>`;
  }
  _render({map, datacatalog}) {
    return html`<style>
      :host {
        display: inline-block;
        min-width: 200px;
        min-height: 200px;
      }
      .data {
          cursor: pointer;
      }
      </style>
    <div>
        ${this.renderTree(datacatalog)}
    </div>`
  }
  _didRender() {
    ;
  }
  getDataInfo(treenodes, dataid) {
    let result = null;
    treenodes.forEach(elem=>{
        if (!result) {
            if(elem.type=="group"){
                const subresult = this.getDataInfo(elem.sublayers, dataid);
                if (subresult) {
                    result = subresult;
                }
            } else {
                if (elem.layerInfo && elem.layerInfo.id === dataid) {
                    result = elem.layerInfo;
                }
            }
        }
    });
    return result;
  }
  handleClick(e, dataid) {
      if (dataid) {
        const detail = this.getDataInfo(this.datacatalog, dataid);
        if (detail.source.type=="topojson") {
          fetch(detail.source.data).then(data=> {
            data.json().then(json=>{
              // replace url with topojson first object converted to geojson
              detail.source.data = topojson.feature(json, json.objects[Object.keys(json.objects)[0]]);
              detail.source.type = "geojson";
              this.dispatchEvent(new CustomEvent('addlayer', {
                detail: detail
              }))
            })
          }).catch(reason=>console.log(reason));
        } else {
          this.dispatchEvent(new CustomEvent('addlayer', 
            {detail: this.getDataInfo(this.datacatalog, dataid)}
          ));
        }
      }
  }
  _firstRendered() {
  }
}
customElements.define('map-data-catalog', MapDataCatalog);
