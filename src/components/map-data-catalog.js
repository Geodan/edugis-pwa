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
            return html`<li><span class="data" dataid$="${elem.layerInfo?elem.layerInfo.id:''}">${elem.title}</span></li>`;
        }
    })}</ul>`;
  }
  _render({map, datacatalog}) {
    return html`<style>
      :host {
        position: absolute;
        display: inline-block;
        min-width: 200px;
        min-height: 200px;
        left: 10px;
        top: 10px;
        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        background-color: white;
        padding: 5px;
      }
      .data {
          cursor: pointer;
      }
      </style>
    <div>
        Layer data sources
        ${this.renderTree(datacatalog)}
    </div>`
  }
  _didRender() {
    ;
  }
  getDataInfo(nodeList, dataid) {
    let result = null;
    nodeList.forEach(elem=>{
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
  _firstRendered() {
    const self = this;
    const datasets = this.shadowRoot.querySelectorAll('.data');
    datasets.forEach(dataset=>{
        dataset.addEventListener("click", function(){
            self.dispatchEvent(new CustomEvent('addlayer', 
                {detail: self.getDataInfo(self.datacatalog, this.getAttribute("dataid"))}
            ));
        });
    });
  }
}
customElements.define('map-data-catalog', MapDataCatalog);
