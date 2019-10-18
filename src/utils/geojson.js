// Checks if `list` looks like a `[x, y]`.

class Feature {
  constructor(typeName) {
    this.type = "Feature";
    this.properties = {};
    this.geometry = {
      "type": typeName,
      "coordinates": []
    }
  }
}


export class GeoJSON {
  static _isXY(list) {
    return list.length >= 2 &&
      typeof list[0] === 'number' &&
      typeof list[1] === 'number';
  }

  static _traverseCoords(coordinates, callback) {
    if (GeoJSON._isXY(coordinates)) return callback(coordinates);
    return coordinates.map(function(coord){return GeoJSON._traverseCoords(coord, callback);});
  }

  // Simplistic shallow clone that will work for a normal GeoJSON object.
  static _clone(obj) {
    if (null == obj || 'object' !== typeof obj) return obj;
    var copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }
  
  static _traverseGeoJson(geometryCb, nodeCb, geojson) {
    if (geojson == null) return geojson;
  
    var r = GeoJSON._clone(geojson);
    var self = GeoJSON._traverseGeoJson.bind(this, geometryCb, nodeCb);
  
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

  static _detectCrs(geojson, projs) {
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

  static _getProj(crs, projs) {
    if (typeof crs === 'string') {
      return projs[crs] || proj4.Proj(crs);
    }
  
    return crs;
  }

  static _calcBbox(geojson) {
    var min = [Number.MAX_VALUE, Number.MAX_VALUE],
        max = [-Number.MAX_VALUE, -Number.MAX_VALUE];
    GeoJSON._traverseGeoJson(function(_gj) {
      GeoJSON._traverseCoords(_gj.coordinates, function(xy) {
        min[0] = Math.min(min[0], xy[0]);
        min[1] = Math.min(min[1], xy[1]);
        max[0] = Math.max(max[0], xy[0]);
        max[1] = Math.max(max[1], xy[1]);
      });
    }, null, geojson);
    return [min[0], min[1], max[0], max[1]];
  }

  static _project(geojson, from, to, projs) {
    projs = projs || {};
    if (!from) {
      from = GeoJSON._detectCrs(geojson, projs);
    } else {
      from = GeoJSON._getProj(from, projs);
    }
    to = GeoJSON._getProj(to, projs);
    var transform = proj4(from, to).forward.bind(transform);
  
    var transformGeometryCoords = function(gj) {
      // No easy way to put correct CRS info into the GeoJSON,
      // and definitely wrong to keep the old, so delete it.
      if (gj.crs) {
        delete gj.crs;
      }
      gj.coordinates = GeoJSON._traverseCoords(gj.coordinates, transform);
    }
  
    var transformBbox = function(gj) {
      if (gj.bbox) {
        gj.bbox = GeoJSON._calcBbox(gj);
      }
    }
  
    return GeoJSON._traverseGeoJson(transformGeometryCoords, transformBbox, geojson);
  }

  /*
  _reverse(geojson) {
    return this._traverseGeoJson(function(gj) {
      gj.coordinates = traverseCoords(gj.coordinates, function(xy) {
        return [ xy[1], xy[0] ];
      });
    }, null, geojson);
  }
  */
  
  static _toWgs84(geojson, from, projs) {
    return GeoJSON._project(geojson, from, proj4.WGS84, projs);
  }
  
  static convertTopoJsonLayer(layerInfo) {
    return fetch(layerInfo.source.data).then(data=> {
      return data.json().then(json=>{
        // replace url with topojson first object converted to geojson
        layerInfo.metadata.originaldata = layerInfo.source.data;
        layerInfo.source.data = topojson.feature(json, json.objects[Object.keys(json.objects)[0]]);
        return layerInfo;        
      })
    }).catch(reason=>console.log(reason));
  }

  static loadGeoJsonToMemory(layerInfo) {
    if (typeof layerInfo.source.data === "string") {
      return fetch(layerInfo.source.data)
        .then(data=>data.json())
        .then(json=>{
          layerInfo.metadata.originaldata = layerInfo.source.data;
          layerInfo.source.data = json;
          return layerInfo;
        });     
    }    
  }

  static convertProjectedGeoJsonLayer(layerInfo) {
    const crs = layerInfo.metadata.crs;
    if (typeof layerInfo.data == 'object') {
      return new Promise((resolve, reject)=>{
        if (!layerInfo.metadata.originaldata) {
          layerInfo.metadata.originaldata = layerinfo.source.data;
          layerInfo.source.data = GeoJSON._toWgs84(layerInfo.source.data, proj4.Proj("EPSG:3857"));
        }
        resolve();
      })
    } else {
      return fetch(layerInfo.source.data).then(data=>data.json()).then(json=>{
        layerInfo.metadata.originaldata = layerInfo.source.data;
        layerInfo.source.data = GeoJSON._toWgs84(json, proj4.Proj("EPSG:3857"));
        return layerInfo;
      })
    }
  }

  static _uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // returns a point-layer, line-layer, fill-layer if point, line, polygon features exist
  static createLayers(droppedFile) {
    const result = [];
    const filename = droppedFile.filename.replace(/\.[^/.]+$/,"");
    const geojson = droppedFile.data;
    if (geojson.type === "Feature") {
      // convert to FeatureCollection
      geojson.type = "FeatureCollection";
      geojson.features = [{
        "type": "Feature",
        "geometry": object.assign({}, geojson.geometry),
        "properties": object.assign({}, geojson.properties)
      }];
      delete geojson.geometry;
      delete geojson.properties;
    }
    if (geojson.features && geojson.features.length) {
      const fillFeatures = geojson.features.filter(feature=>feature.geometry && (feature.geometry.type==='Polygon'||feature.geometry.type==='MultiPolygon'));
      const lineFeatures = geojson.features.filter(feature=>feature.geometry && (feature.geometry.type==='LineString'||feature.geometry.type==='MultiLineString'));
      const pointFeatures = geojson.features.filter(feature=>feature.geometry && (feature.geometry.type==='Point'||feature.geometry.type==='MultiPoint'));
      if (fillFeatures.length) {
        result.push( 
        {
            "metadata": {"title": `${filename} fill`},
            "id": GeoJSON._uuidv4(),
            "type":"fill",
            "source":{
              "type":"geojson",
              "data": {"type": "FeatureCollection", "features": fillFeatures},
              "attribution":"unknown"
            },
            "paint":{
              "fill-color":"#ccc",
              "fill-opacity":0.6,
              "fill-outline-color":"#444"
            }
        });
      }
      if (lineFeatures.length) {
        result.push(
          {
            "metadata": {"title": `${filename} line`},
            "id": GeoJSON._uuidv4(),
            "type":"line",
            "source":{
              "type":"geojson",
              "data": {"type": "FeatureCollection", "features": lineFeatures},
              "attribution":"unknown"
            },
            "paint":{
              "line-color":"#000",
              "line-width": 2
            }
          });
      }
      if (pointFeatures.length) {
        result.push(
          {
              "metadata": {"title": `${filename} point`},
              "id": GeoJSON._uuidv4(),
              "type":"circle",
              "source":{
                "type":"geojson",
                "data": {"type": "FeatureCollection", "features": pointFeatures},
                "attribution":"unknown"
              },
              "paint":{
                "circle-color":"#FA0",
                "circle-radius": 10,
                "circle-stroke-width": 1,
                "circle-stroke-color": "#FFF"
              }
          }
        );
      }
    }
    return result;
  }
  static Feature(typeName) {
    return new Feature(typeName);
  }
}
