import {LitElement, html, css} from 'lit-element';
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
    }
    disconnectedCallback() {
        super.disconnectedCallback()
        window.removeEventListener('savelayer', (event)=>this._savelayer(event));
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
    _savelayer(e) {
        const mapboxglStyle = JSON.parse(JSON.stringify(this.webmap.getLayer(e.detail.layerid).serialize()));
        this._styleCleanup(mapboxglStyle);
        const source = this.webmap.getSource(mapboxglStyle.source).serialize();
        if (source.type === 'geojson') {
            const geojson = source.data;
            geojson.style = mapboxglStyle;
            const blob = new Blob([JSON.stringify(geojson, null, 2)], {type: "application/json"});
            const filename = mapboxglStyle.metadata.title ? `${mapboxglStyle.metadata.title.replace(' ', '_')}.geo.json` : 'layer.geo.json'
            window.saveAs(blob, filename);
            console.log(source.data);
        }
    }
}

customElements.define('map-save-layer', MapSaveLayer);