
// Checks if `list` looks like a `[x, y]`.
function isXY(list) {
  return list.length >= 2 &&
    typeof list[0] === 'number' &&
    typeof list[1] === 'number';
}

function traverseCoords(coordinates, callback) {
  if (isXY(coordinates)) return callback(coordinates);
  return coordinates.map(function(coord){return traverseCoords(coord, callback);});
}

// Simplistic shallow clone that will work for a normal GeoJSON object.
function clone(obj) {
  if (null == obj || 'object' !== typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
}

function traverseGeoJson(geometryCb, nodeCb, geojson) {
  if (geojson == null) return geojson;

  var r = clone(geojson);
  var self = traverseGeoJson.bind(this, geometryCb, nodeCb);

  switch (geojson.type) {
  case 'Feature':
    r.geometry = self(geojson.geometry);
    break;
  case 'FeatureCollection':
    r.features = r.features.map(self);
    break;
  case 'GeometryCollection':
    r.geometries = r.geometries.map(self);
    break;
  default:
    geometryCb(r);
    break;
  }

  if (nodeCb) nodeCb(r);

  return r;
}

function detectCrs(geojson, projs) {
  var crsInfo = geojson.crs,
      crs;

  if (crsInfo === undefined) {
    throw new Error('Unable to detect CRS, GeoJSON has no "crs" property.');
  }

  if (crsInfo.type === 'name') {
    crs = projs[crsInfo.properties.name];
  } else if (crsInfo.type === 'EPSG') {
    crs = projs['EPSG:' + crsInfo.properties.code];
  }

  if (!crs) {
    throw new Error('CRS defined in crs section could not be identified: ' + JSON.stringify(crsInfo));
  }

  return crs;
}

function determineCrs(crs, projs) {
  if (typeof crs === 'string' || crs instanceof String) {
    return projs[crs] || proj4.Proj(crs);
  }

  return crs;
}

function calcBbox(geojson) {
  var min = [Number.MAX_VALUE, Number.MAX_VALUE],
      max = [-Number.MAX_VALUE, -Number.MAX_VALUE];
  traverseGeoJson(function(_gj) {
    traverseCoords(_gj.coordinates, function(xy) {
      min[0] = Math.min(min[0], xy[0]);
      min[1] = Math.min(min[1], xy[1]);
      max[0] = Math.max(max[0], xy[0]);
      max[1] = Math.max(max[1], xy[1]);
    });
  }, null, geojson);
  return [min[0], min[1], max[0], max[1]];
}

function reproject(geojson, from, to, projs) {
  projs = projs || {};
  if (!from) {
    from = detectCrs(geojson, projs);
  } else {
    from = determineCrs(from, projs);
  }

  to = determineCrs(to, projs);
  var transform = proj4(from, to).forward.bind(transform);

  var transformGeometryCoords = function(gj) {
    // No easy way to put correct CRS info into the GeoJSON,
    // and definitely wrong to keep the old, so delete it.
    if (gj.crs) {
      delete gj.crs;
    }
    gj.coordinates = traverseCoords(gj.coordinates, transform);
  }

  var transformBbox = function(gj) {
    if (gj.bbox) {
      gj.bbox = calcBbox(gj);
    }
  }

  return traverseGeoJson(transformGeometryCoords, transformBbox, geojson);
}

function reverse(geojson) {
  return traverseGeoJson(function(gj) {
    gj.coordinates = traverseCoords(gj.coordinates, function(xy) {
      return [ xy[1], xy[0] ];
    });
  }, null, geojson);
}

function toWgs84(geojson, from, projs) {
  return reproject(geojson, from, proj4.WGS84, projs);
}

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
  convertTopoJsonLayer(layerInfo) {
    return fetch(layerInfo.source.data).then(data=> {
      return data.json().then(json=>{
        // replace url with topojson first object converted to geojson
        layerInfo.metadata.originaldata = layerInfo.source.data;
        layerInfo.source.data = topojson.feature(json, json.objects[Object.keys(json.objects)[0]]);
        return layerInfo;        
      })
    }).catch(reason=>console.log(reason));
  }
  convertProjectedGeoJsonLayer(layerInfo) {
    const crs = layerInfo.metadata.crs;
    if (typeof layerInfo.data == 'object') {
      return new Promise((resolve, reject)=>{
        if (!layerInfo.metadata.originaldata) {
          layerInfo.metadata.originaldata = layerinfo.source.data;
          layerInfo.source.data = toWgs84(layerInfo.source.data, proj4.Proj("EPSG:8557"));
        }
        resolve();
      })
    } else {
      return fetch(layerInfo.source.data).then(data=>data.json()).then(json=>{
        layerInfo.metadata.originaldata = layerInfo.source.data;
        layerInfo.source.data = toWgs84(json, proj4.Proj("EPSG:3857"));
        return layerInfo;
      })
    }
  }
  extractLegendUrl(layerInfo)
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
          layerInfo.metadata.legendurl = this.extractLegendUrl(node.layerInfo);
        }
      }
      layerInfo.metadata.reference = (node.type === "reference");
      if (layerInfo.source.type == "geojson" && layerInfo.metadata.topojson && !layerInfo.metadata.originaldata) {
        await this.convertTopoJsonLayer(layerInfo);
      } 
      if (layerInfo.source.type == "geojson" && layerInfo.metadata && layerInfo.metadata.crs && !layerInfo.metadata.originaldata) {
        await this.convertProjectedGeoJsonLayer(layerInfo);
      }
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
