import mapboxcss from "./mapbox-gl-css.js";
import maplibrecss from "./maplibre-gl-css.js";

export const mapgl = typeof maplibregl === 'undefined' ? mapboxgl : maplibregl;
mapgl.css = typeof maplibregl === 'undefined' ? mapboxcss : maplibrecss;
mapgl.libName = typeof maplibregl === 'undefined' ? 'mapboxgl' : 'maplibregl';
export default mapgl;

