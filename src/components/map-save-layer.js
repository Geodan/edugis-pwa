import {LitElement, html, css} from 'lit';
class MapSaveLayer extends LitElement {
    static get styles() {
        return css`
        :host {
            display: block;
        }`
    }
    static get properties() { 
        return { 
          webmap: {type: Object},
        }; 
    }
    constructor() {
        super();
        this.webmap = undefined;
    }
    connectedCallback() {
        super.connectedCallback()
        window.addEventListener('savelayer', (event)=>this._savelayer(event));
        window.addEventListener('savelayers', (event)=>this._savelayers(event));
    }
    disconnectedCallback() {
        super.disconnectedCallback()
        window.removeEventListener('savelayer', (event)=>this._savelayer(event));
        window.removeEventListener('savelayers', (event)=>this._savelayers(event));
    }
    shouldUpdate(changedProp) {
        if (changedProp.has('sprop')) {
            // do something with sprop change
        }
        return true;
    }
    render() {
        return html``;
    }
    firstUpdated() {

    }
    updated() {

    }
    _styleCleanup(style) {
        if (style.metadata) {
            const metadata = style.metadata;
            delete metadata.userlayer;
            delete metadata.cansave;
            delete metadata.activeEdits;
        }
        if (style.layout && style.layout.visibility && style.layout.visibility === 'none') {
            delete style.layout.visibility;
        }
    }
    _getLayerJson(layerid) {
        const layer = this.webmap.getLayer(layerid);
        if (layer) {
            const mapboxglStyle = JSON.parse(JSON.stringify(layer.serialize()));
            this._styleCleanup(mapboxglStyle);
            const source = this.webmap.getSource(mapboxglStyle.source).serialize();
            if (source.type === 'geojson') {
                const geojson = source.data;
                geojson.style = mapboxglStyle;
                return geojson;
            }
            mapboxglStyle.source = source;
            return {
                style: mapboxglStyle
            }
        }
        return {};
    }
    _savelayer(e) {
        const geojson = this._getLayerJson(e.detail.layerid);
        const blob = new Blob([JSON.stringify(geojson, null, 2)], {type: "application/json"});
        const filename = geojson.style.metadata.title ? `${geojson.style.metadata.title.replace(' ', '_')}.geo.json` : 'layer.geo.json'
        window.saveAs(blob, filename);
    }
    _savelayers(e) {
        const layerset = [];
        for (const layerid of e.detail.layerids) {
            const geojson = this._getLayerJson(layerid);
            layerset.push(geojson);
        }
        const blob = new Blob([JSON.stringify(layerset,null,2)], {type: "application/json"});
        const filename = 'layerset.geo.json';
        window.saveAs(blob, filename);
    }
}

customElements.define('map-save-layer', MapSaveLayer);