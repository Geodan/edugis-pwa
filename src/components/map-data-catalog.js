import {LitElement, html} from '@polymer/lit-element';
class MapDataCatalog extends LitElement {
  static get properties() { 
    return { 
      layerlist: Object
    }; 
  }
  constructor() {
    super();
    this.map = null;
    this.layerlist = null;
  }
  /*_createRoot() {
    console.log('_createRoot()');
    return this;
  }*/
  _shouldRender(props, changedProps, prevProps) {
    return (props.layerlist != null);
  }
  _render({map, layerlist}) {
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
      </style>
    <div>
        Layer data sources
        <ul>
            <li>WMS
                <ul>
                    <li><input type="checkbox" value="wms!">WMS layer</li>
                </ul>
            </li>
            <li>WMS Service
                <ul>
                    <li><input type="checkbox" value="wms!">WMS Capabilities</li>
                </ul>
            </li>
            <li>WMST
                <ul>
                    <li><input type="checkbox" value="${this.layerlist[2].layerInfo.id}">WMST layer</li>
                </ul>
            </li>
            <li>TMS
                <ul>
                    <li><input type="checkbox" value="wms!">TMS layer</li>
                </ul>
            </li>
            <li>WFS
                <ul>
                    <li><input type="checkbox">WFS layer</li>
                </ul>
            </li>
            <li>GeoJSON
                <ul>
                    <li><input type="checkbox">GeoJSON layer</li>
                </ul>
            </li>
            <li>Vector Tile
                <ul>
                    <li><input type="checkbox">Vector layer</li>
                </ul>
            </li>
            <li> Google spreadsheet
                <ul>
                    <li><input type="checkbox">Google spreadsheet layer</li>
                </ul>
            </li>
            <li> CSV
                <ul>
                    <li><input type="checkbox">CSV layer</li>
                </ul>
            </li>
        </ul>
    </div>`
  }
  _didRender() {
    ;
  }
  _firstRendered() {
    const self = this;
    const checkBoxes = this.shadowRoot.querySelectorAll('input');
    checkBoxes.forEach(checkbox=>{
        checkbox.addEventListener("click", function(){
            self.dispatchEvent(new CustomEvent('clicklayer', 
                {detail: {id: this.value, on: this.checked}}
            ));
        });
    });
  }
}
customElements.define('map-data-catalog', MapDataCatalog);
