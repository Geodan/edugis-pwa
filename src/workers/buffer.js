importScripts('https://unpkg.com/@turf/turf@6/turf.min.js');
//importScripts('../../node_modules/@turf/buffer/dist/es/index.js');

this.onmessage = function(evt) {
    const geojson = evt.data[0];
    const bufsize = evt.data[1];
    const bufferedFeatures = turf.buffer(geojson, bufsize, { units: 'meters' });
    postMessage(bufferedFeatures);
}