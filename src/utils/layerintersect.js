import Flatbush from 'flatbush';
import cloneJSON from '../utils/clonejson';

function flatBushIndex(layer) {
  const flatbushIndex = new Flatbush(layer.features.length);
  for (const feature of layer.features) {
    const bbox = turf.bbox(feature);
    flatbushIndex.add(bbox[0], bbox[1], bbox[2], bbox[3]);
  }
  flatbushIndex.finish();
  return flatbushIndex;
}

export function layerIntersect(layer1, layer2) {
  if (layer1 && layer1.type && layer1.type === "FeatureCollection" && layer2 && layer2.type && layer2.type === "FeatureCollection") {
    // create index on layer2
    const layerIndex = flatBushIndex(layer2);
    layer1 = cloneJSON(layer1);
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
  return layer1;
}