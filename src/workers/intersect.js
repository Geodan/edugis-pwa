importScripts('https://unpkg.com/@turf/turf@6/turf.min.js');
importScripts('https://cdn.jsdelivr.net/npm/flatbush@4.0.0/flatbush.min.js');

function flatBushIndex(layer) {
  const flatbushIndex = new Flatbush(layer.features.length);
  for (const feature of layer.features) {
    const bbox = turf.bbox(feature);
    flatbushIndex.add(bbox[0], bbox[1], bbox[2], bbox[3]);
  }
  flatbushIndex.finish();
  return flatbushIndex;
}


this.onmessage = function (evt) {
  const layer1 = evt.data[0];
  const layer2 = evt.data[1]

  if (layer1 && 
      layer1.type && 
      layer1.type === "FeatureCollection" && 
      layer2 && 
      layer2.type && 
      layer2.type === "FeatureCollection" && 
      layer1.features && 
      layer1.features.length && 
      layer2.features && 
      layer2.features.length) {
    // create index on layer2
    const layerIndex = flatBushIndex(layer2);
    for (const feature of layer1.features) {
      const bbox = turf.bbox(feature);
      const intersectCandidates = layerIndex.search(bbox[0], bbox[1], bbox[2], bbox[3]);
      for (const candidate of intersectCandidates) {
        const feature2 = layer2.features[candidate];
        if (turf.booleanIntersects(feature, feature2)) {
          feature.properties.intersect = true;
          break;
        }
      }
    }
  }
  for (const feature of layer1.features) {
    if (!feature.properties.intersect) {
      feature.properties.intersect = false;
    }
  }
  postMessage(layer1);
}