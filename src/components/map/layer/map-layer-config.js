import {html, css, LitElement} from 'lit-element';
import './map-layer-config-legend.js';
import mbStyleParser from '../../../utils/mbox-style-parse.js';
import colorbrewer from '../../../lib/colorbrewer.js';


/**
* @polymer
* @extends HTMLElement
*/
class MapLayerConfig extends LitElement {
    static get properties() {
        return {
            zoom: {type: Number},
            layer: {type: Object},
            datagetter: {type: Object}
        }
    }
    static get styles() {
        return css`
            :host {
                display: inline-block;
            }
        `
    }
    constructor() {
        super();
        this.layer = null;
        this.zoom = 0;
    }
    shouldUpdate(changedProperties) {
        if (changedProperties.has('layer')) {
            this.legendInfo = this._getLegendInfoFromLayer();
        }
        return true;
    }
    render() {
        return html`
        <map-layer-config-legend .layer=${this.layer}></map-layer-config-legend>
        `
    }
    _getLegendInfoFromLayer() {
        let layerTitle = this.layer.metadata.title?this.layer.metadata.title:this.layer.id;
        let paint = this.layer.metadata.paint ? this.layer.metadata.paint : this.layer.paint;
        let paintStyle = paint["fill-color"];
        let legendInfo = mbStyleParser.paintStyleToLegendItems(paintStyle, 'fill', this.zoom, layerTitle);
        console.log(legendInfo);
        let dataProperties = this._getDataProperties();
        console.log(dataProperties);
        return legendInfo;
    }
    _getDataProperties() {
        let stylePropertyName = this._getLayerStylePropertyName();
        let data;
        if (this.datagetter && this.datagetter.getSource) {
          const source = this.datagetter.getSource(this.layer.source);
          if (source.type === 'geojson') {
            data = source.serialize().data.features;
          }
        }
        if (!data) {
          if (this.datagetter && this.datagetter.querySourceFeatures) {
            data = this.datagetter.querySourceFeatures(this.layer.source, {sourceLayer: this.layer["source-layer"]});
          }
        }
        if (!stylePropertyName && data && data.length) {
          const properties = data[0].properties;
          const keys = Object.keys(properties);
          if (keys.length) {
            stylePropertyName = keys[0]; // todo: create property chooser
          }
        }
        const minmax = this._getMinMax(data, stylePropertyName);
        return {property: stylePropertyName, minmax: minmax, values: data.map(item=>item.properties[stylePropertyName])}
    }
    _getLayerStylePropertyName() {
        let paint;
        switch (this.layer.type) {
          case 'fill':
            paint = this.layer.paint['fill-color'];
            break;
          case 'line':
            paint = this.layer.paint['line-color'];
            break;
          case 'circle':
            paint = this.layer.paint['circle-color'];
            break;
        }
        if (paint.property) {
          return paint.property;
        }
        if (Array.isArray(paint)) {
          if (paint[0] === "step") {
            if (paint[1][0] === "get") {
              return paint[1][1];
            }
          }
        }
        return undefined;
    }
    _getMinMax(data, property) {
        const maxstr = 'zzzzzzzz';
        const result = {
          type: "undefined",
          min: Number.MAX_VALUE,
          max: Number.MIN_VALUE,
          minstr: maxstr,
          maxstr: '',
          undefinedcount: 0
        };
        if (data.length) {
          data.forEach(element=>{
            const value = element.properties[property];
            switch (typeof value) {
              case 'undefined':
                result.undefinedcount++;
              case 'number':
                if (value < result.min) {
                  result.min = value;
                }
                if (value > result.max) {
                  result.max = value;
                }
                break;
              case 'string':
                if (value < result.minstr) {
                  result.minstr = value;
                }
                if (value > result.maxstr) {
                  result.maxstr = value;
                }
                break;
            }
          });
        }
        if (result.minstr === maxstr) {
          result.minstr = '';
        }
        if (result.min > result.max) {
          result.min = result.max = 0;
        }
        return result;
    }
}

window.customElements.define('map-layer-config', MapLayerConfig);