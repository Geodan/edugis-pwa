
import {LitElement, html} from '@polymer/lit-element';
import './map-layer-tree';
/**
* @polymer
* @extends HTMLElement
*/
class MapDataCatalog extends LitElement {
  static get properties() { 
    return { 
      datacatalog: Object,
      maplayers: Array
    }; 
  }
  constructor() {
    super();
    this.datacatalog = null;
    this.maplayers = [];
  }
  setListIds(list) {
    list.forEach(item=>{
      if (!item.hasOwnProperty("id")) {
        item.id = item.title;
      }
      if (item.sublayers) {
        this.setListIds(item.sublayers);
      }
    });
  }
  shouldUpdate(changedProps) {
    if (changedProps.has("datacatalog")) {
      if (this.datacatalog) {
        this.setListIds(this.datacatalog);
      }
    }
    return (this.datacatalog != null);
  }

  toggleLayer(e) {
    if (e.detail.checked) {
      this.handleClick(e, e.detail);
    } else {
      if (e.detail.layerInfo.id) {
        this.dispatchEvent(
          new CustomEvent('removelayer',
            {
                detail: {layerid: e.detail.layerInfo.id}
            })
      );
      }
    }
  }
  render() {
    return html`<map-layer-tree headertext="Data-catalogus" .nodelist="${this.datacatalog}" .maplayers="${this.maplayers}" @toggleitem="${e=>this.toggleLayer(e)}"></map-layer-tree>`;
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
  insertServiceKey(layerInfo) {
    /* replace '{geodanmapskey}' by EduGISkeys.geodanmaps, '{freetilehostingkey}' by EduGISkeys.freetilehosting etc. */
    for (let key in EduGISkeys) {
      const keyTemplate = `{${key}key}`;
      if (layerInfo.source.tiles) {
        layerInfo.source.tiles = layerInfo.source.tiles.map(tileurl=>tileurl.replace(keyTemplate, EduGISkeys[key]));
      }
      if (layerInfo.source.url) {
        layerInfo.source.url = layerInfo.source.url.replace(keyTemplate, EduGISkeys[key]);
      }
    }
  }
  insertTime(layerInfo){
    //2018-09-21T23:35:00Z
    let interval = 300000; // 5 minutes default
    if (layerInfo.metadata && layerInfo.metadata.timeinterval) {
      interval = layerInfo.metadata.timeinterval;
    }
    const now = encodeURIComponent(new Date(Math.floor((Date.now() - (2 * interval)) / interval) * interval).toISOString());
    if (layerInfo.source.tiles) {
      layerInfo.source.tiles = layerInfo.source.tiles.map(tileurl=>tileurl.replace('{time}', now));
    }
    if (layerInfo.source.url) {
      layerInfo.source.url = layerInfo.source.url.replace('{time}', now);
    }
  }
  guessLegendUrl(layerInfo)
  {
    let legendUrl = '';
    let tileUrl = layerInfo.source.url;
    if (!tileUrl) {
      tileUrl = layerInfo.source.tiles[0];
    }
    if (tileUrl) {
      const urlparts = tileUrl.split('?'); // [baseurl,querystring]
      const params = urlparts[1].split('&').map(param=>param.split('='))
        .filter(param=>
          ["BBOX", "REQUEST", "SRS", "WIDTH",
           "HEIGHT", "TRANSPARENT"].indexOf(param[0].toUpperCase()) == -1
        )
        .map(param=>{
          if (param[0].toUpperCase() === 'LAYERS') {
            return ['layer', param[1].split(',')[0]];
          }
          return param;
        })
        .map(param=>param.join('=')).join('&');
      legendUrl = urlparts[0] + '?' + params + '&REQUEST=GetLegendGraphic';
    }
    return legendUrl;
  }
  async handleClick(e, node) {
    if (node.layerInfo && node.layerInfo.id) {
      const layerInfo = node.layerInfo;
      this.insertServiceKey(layerInfo);
      this.insertTime(layerInfo);
      if (!layerInfo.metadata) {
        layerInfo.metadata = {};
      }
      if (!layerInfo.metadata.title) {
        layerInfo.metadata.title = node.title;
      }
      if (node.type === 'wms') {
        if (!layerInfo.metadata.legendurl && layerInfo.metadata.legendurl !== '') {
          layerInfo.metadata.legendurl = this.guessLegendUrl(node.layerInfo);
        }
      }
      layerInfo.metadata.reference = (node.type === "reference");
      if (layerInfo.metadata && layerInfo.metadata.bing && layerInfo.source.url) {
        const bingMetadata = await fetch(layerInfo.source.url).then(data=>data.json());
        const sourceMaxzoom = layerInfo.source.maxzoom;
        layerInfo.source = {
          "type" : "raster",
          "tileSize" : 256,
          "attribution" : bingMetadata.resourceSets[0].resources[0].imageryProviders.map(provider=>provider.attribution).join('|'),
          "tiles": bingMetadata.resourceSets[0].resources[0].imageUrlSubdomains.map(domain=>bingMetadata.resourceSets[0].resources[0].imageUrl.replace('{subdomain}', domain).replace('{culture}', 'nl-BE'))
        }
        if (sourceMaxzoom) {
          layerInfo.source.maxzoom = sourceMaxzoom;
        }
      }
      this.dispatchEvent(new CustomEvent('addlayer', 
        {detail: layerInfo}
      ))
    }
  }
}

customElements.define('map-data-catalog', MapDataCatalog);
