import {wmsUrl} from './wmsurl';

function convertToArray(layerlist) {
    if (!layerlist) {
        return [];
    }
    if (Array.isArray(layerlist)){
        return layerlist;
    }
    return layerlist.split(',').map(layer=>layer.trim());
}

function allowedLayer(Layer, deniedlayers, allowedlayers) {
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

function scaleHintToZoomLevel(hint)
  {
    for (let level = 0, calc = 110692.6408; level < 22; level++, calc /= 2.0) {
      if (hint > calc) {
        return level;
      }
    }
}

function preferredFeatureInfoFormat(formats) {
  if (formats.includes('application/json')) {
    return 'application/json';
  }
  if (formats.includes('application/vnd.ogc.gml')) {
    return 'application/vnd.ogc.gml';
  }
  if (formats.includes('application/xml')) {
    return 'application/xml';
  }
  if (formats.includes('text/plain')) {
    return 'text/plain';
  }
  // not supported
  return '';
}

function layerToNode(Layer, Request) {
    let onlineResource = new URL(Request.GetMap.DCPType[0].HTTP.Get.OnlineResource);
    // upgrade to https (cannot load from http)
    if (onlineResource.protocol === 'http:') {
      onlineResource.protocol = 'https:';
      onlineResource.port = 443;
    }
    onlineResource = onlineResource.toString();
    let featureInfoResource = new URL(Request.GetFeatureInfo.DCPType[0].HTTP.Get.OnlineResource);
    if (featureInfoResource.protocol === 'http:') {
      featureInfoResource.protocol = 'https:';
      featureInfoResource.port = 443;
    }
    const node = { "title": Layer.Title, "id": Layer.Name, "type":"wmsfromcaps", "layerInfo": {
      "id" : Layer.Name,
      "type" : "raster",
      "metadata" : {
          "title" : Layer.Title,
          "legendurl": Layer.Style ? Layer.Style[0].LegendURL[0].OnlineResource : undefined
      },
      "source" : {
          "type": "raster",
          "tileSize" : 512,
          "tiles": [
              onlineResource + "service=WMS&version=1.1.1&request=GetMap&layers=" + encodeURIComponent(Layer.Name) + "&SRS=EPSG:3857&transparent=true&format=image/png&BBOX={bbox-epsg-3857}&width=512&height=512&styles=" // + encodeURIComponent(Layer.Style[0].Name)
          ],
          "attribution": Layer.Attribution && Layer.Attribution.Title ? Layer.Attribution.Title: ""
          }
      }
    }
    if (Layer.queryable) {
      const getFeatureInfoFormat = preferredFeatureInfoFormat(Request.GetFeatureInfo.Format);
      if (getFeatureInfoFormat != '') {
        node.layerInfo.metadata.getFeatureInfoUrl = featureInfoResource + "service=WMS&version=1.1.1&request=GetFeatureInfo&layers=" + encodeURIComponent(Layer.Name) + "&query_layers=" + encodeURIComponent(Layer.Name)
        node.layerInfo.metadata.getFeatureInfoFormat = getFeatureInfoFormat;
      }
    }
    if (Layer.ScaleHint) {
      if (Layer.ScaleHint.max) {
        node.layerInfo.minzoom = scaleHintToZoomLevel(Layer.ScaleHint.max);
        node.layerInfo.source.minzoom = node.layerInfo.minzoom;
      }
      if (Layer.ScaleHint.min) {
        node.layerInfo.maxzoom = scaleHintToZoomLevel(Layer.ScaleHint.min);
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
        node.layerInfo.source.bounds = [...forward([bbox3857.extent[0], bbox3857.extent[1]]), ...forward([bbox3857.extent[2],bbox3857.extent[3]])];
      }
    } 
    return node;
}

function capabilitiesToCatalogNodes(xml, deniedlayers, allowedlayers) {
    const parser = new WMSCapabilities();
    const json = parser.parse(xml);
    const result = [];
    if (!json.Capability) {
      // no capabilities
      return result;
    }
    deniedlayers = convertToArray(deniedlayers);
    allowedlayers = convertToArray(allowedlayers);
    if (json.Capability.Layer.Name && json.Capability.Layer.Name !== '') {
        // non-empty root layer
        if (allowedLayer(json.Capability.Layer, deniedlayers, allowedlayers)) {
            result.push(layerToNode(json.Capability.Layer, json.Capability.Request));
        }
    }
    if (json.Capability.Layer.Layer && json.Capability.Layer.Layer.length) {
        // array of sublayers
        json.Capability.Layer.Layer.forEach(Layer=>{
            if (allowedLayer(Layer, deniedlayers, allowedlayers)) {
                result.push(layerToNode(Layer, json.Capability.Request));
            }
        });
    }
    return result;
}

export function getCapabilitiesNodes(node) {
    const url = wmsUrl(node.url, 'getcapabilities');
    return fetch(url).then(response=>{
        if (!response.ok) {
          throw Error(`${node.id}: req rejected with status ${response.status} ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type');
        if (contentType) {
          if (contentType === 'application/vnd.ogc.wms_xml' || contentType.startsWith('text/xml') || contentType.startsWith('application/xml')) {
            // caps 1.1.1 or caps 1.3.0
            return response.text().then(xml=>{
              const nodes = capabilitiesToCatalogNodes(xml, node.deniedlayers, node.allowedlayers);
              if (nodes.length == 0) {
                nodes.push({"title": `${nodeId}: 0 layers or failed`});
              }
              return nodes;
            });
          } else {
              throw Error(`Getcapabilities: unexpected content-type: ${contentType}`);
          }
        } else {
            throw Error('content-type not set in getcapabilities response');
        }
    });
}

export function copyMetadataToCapsNodes(sourceLayerInfo, capsNodes) {
  capsNodes.forEach(node=>{
    if (!node.layerInfo.metadata) {
      node.layerInfo.metadata = {};
    }
    if (sourceLayerInfo.tilecacheurl) {
      node.layerInfo.metadata.tilecacheurl = sourceLayerInfo.tilecacheurl;
    }
  });
}