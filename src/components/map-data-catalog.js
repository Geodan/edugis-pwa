
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
  _shouldRender(props, changedProps, prevProps) {
    return (props.datacatalog != null);
  }
  renderTree(nodeList) {
    return html`<ul>${nodeList.map(node=>{
        if (node.type==="group"){
            return html`<li>${node.title}${this.renderTree(node.sublayers)}</li>`
        } else {
            return html`<li class="data" on-click="${(e)=>{this.handleClick(e, node)}}">${node.title}</li>`;
        }
    })}</ul>`;
  }
  _render({datacatalog}) {
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
    const now = encodeURIComponent(new Date(Math.floor((Date.now() - 600000) / 300000) * 300000).toISOString());
    if (layerInfo.source.tiles) {
      layerInfo.source.tiles = layerInfo.source.tiles.map(tileurl=>tileurl.replace('{time}', now));
    }
    if (layerInfo.source.url) {
      layerInfo.source.url = layerInfo.source.url.replace('{time}', now);
    }
  }
  addTopoJsonLayer(layerInfo) {
    fetch(layerInfo.source.data).then(data=> {
      data.json().then(json=>{
        // replace url with topojson first object converted to geojson
        layerInfo.metadata.originaldata = layerInfo.source.data;
        layerInfo.source.data = topojson.feature(json, json.objects[Object.keys(json.objects)[0]]);
        this.dispatchEvent(new CustomEvent('addlayer', {
          detail: layerInfo
        }))
      })
    }).catch(reason=>console.log(reason));
  }
  addProjectedGeoJsonLayer(layerInfo) {
    const crs = layerInfo.metadata.crs;
    fetch(layerInfo.source.data).then(data=>data.json()).then(json=>{
      layerInfo.metadata.originaldata = layerInfo.source.data;
      layerInfo.source.data = toWgs84(json, proj4.Proj("EPSG:3857"));
      this.dispatchEvent(new CustomEvent('addlayer', {
        detail: layerInfo
      }))
    })
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
          param[0].toUpperCase() !== 'BBOX' && 
          param[0].toUpperCase() !== 'REQUEST' && 
          param[0].toUpperCase() != 'SRS' && 
          param[0].toUpperCase() != 'WIDTH' &&
          param[0].toUpperCase() !== 'HEIGHT' &&
          param[0].toUpperCase() !== 'TRANSPARENT')
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
  handleClick(e, node) {
    if (node.layerInfo && node.layerInfo.id) {
      const layerInfo = node.layerInfo;
      this.insertServiceKey(layerInfo);
      this.insertTime(layerInfo);
      if (!layerInfo.metadata) {
        layerInfo.metadata = {};
      }
      if (node.type === 'wms') {
        if (!layerInfo.metadata.legendurl && layerInfo.metadata.legendurl !== '') {
          layerInfo.metadata.legendurl = this.extractLegendUrl(node.layerInfo);
        }
      }
      layerInfo.metadata.reference = (node.type === "reference");
      if (layerInfo.source.type == "geojson" && layerInfo.metadata.topojson && !layerInfo.metadata.originaldata) {
        this.addTopoJsonLayer(layerInfo);
      } else {
        if (layerInfo.source.type == "geojson" && layerInfo.metadata && layerInfo.metadata.crs && !layerInfo.metadata.originaldata) {
          this.addProjectedGeoJsonLayer(layerInfo);
        } else {
          this.dispatchEvent(new CustomEvent('addlayer', 
            {detail: layerInfo}
          ))
        }
      }
    }
  }
}
customElements.define('map-data-catalog', MapDataCatalog);
