import {html, css, LitElement} from 'lit-element';
import './map-layer-config-legend.js';
import mbStyleParser from '../../../utils/mbox-style-parse.js';
import classify from '../../../lib/classify.js';

// create a map layer definition from the legend and apply it to the map attribute layer
/**
 * 
 * @param {string} layerType 'fill', 'line' or 'circle'
 * @param {stats} stats 
 * @param {object} classInfo 
 * @param {object} legendConfig 
 */
function createPaint(layerType, stats, classInfo, legendConfig) {
  let mapboxPaint;
  if (classInfo.classCount == 1) {
    return classInfo.classes[0].paint;
  }
  switch(classInfo.classType) {
      case 'mostfrequent':
          mapboxPaint = ["case"];
          classInfo.classes.forEach(classItem=>{
              if (classItem.from !== '__other__') {
                  mapboxPaint.push(['==', ["get", stats.column], classItem.from]);
                  mapboxPaint.push(classItem.paint);
              }
          })
          mapboxPaint.push(['!=', ["get", stats.column], null]);
          mapboxPaint.push(classInfo.classes[classInfo.classCount - 1].paint);
          mapboxPaint.push('#000000');
          break;
      case 'quantile':
          mapboxPaint = ["case"]
          classInfo.classes.forEach((classItem, index, arr)=>{
              let nextFrom = (index != arr.length-1)?arr[index+1].from:null;
              if (nextFrom > classItem.to) {
                  nextFrom = null;
              }
              let compare = (classItem.to !== nextFrom)?"<=":"<";
              if (typeof classItem.to == "boolean") {
                  compare = '!=';
              }
              if (stats.datatype === 'numeric') {
                  mapboxPaint.push([compare,["to-number", ["get", stats.column], 0],classItem.to],classItem.paint);
              } else if (stats.datatype === 'timestamptz' || stats.datatype === 'date') {
                  mapboxPaint.push([compare,["get", stats.column],classItem.to.toJSON()],classItem.paint);
              } else {
                  mapboxPaint.push([compare,["get", stats.column],classItem.to],classItem.paint);
              }
          });
          mapboxPaint.push(classInfo.classes[classInfo.classCount - 1].paint)
          break;
      case 'interval':
          if (classInfo.classCount) {
              mapboxPaint = ["case"];
              classInfo.classes.forEach((classItem, index)=>{
                  if (stats.datatype === 'numeric') {
                      // convert javscript string to number
                      mapboxPaint.push(["<", ["to-number",["get", stats.column], 0],classItem.to], classItem.paint);
                  } else {
                      mapboxPaint.push(["<", ["get", stats.column],classItem.to], classItem.paint);
                  }
              })
              mapboxPaint.push(classInfo.classes[classInfo.classCount - 1].paint);
          }
          break;
  }
  return mapboxPaint;
}


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
            if (this.layer.metadata) {
              this.layerTitle = this.layer.metadata.title? this.layer.metadata.title:this.layer.id;
              if (this.layer.metadata.legendConfig) {
                this.legendConfig = this.layer.metadata.legendConfig;
                this.stats = this.layer.metadata.stats;
                this.initialFilter = this.layer.metadata.initialFilter;
              } else {
                let paintPropertyName = `${this.layer.type}-color`;
                let decodedLegend = this._getLegendInfoFromLayer();
                this.stats = this._getDataProperties(decodedLegend.attribute);
                this.initialFilter = this.datagetter ? this.datagetter.getFilter(this.layer.id) : null;
                this.layer.metadata.initialFilter = this.initialFilter;
                this.legendConfig = {
                  classCount: decodedLegend.items.length,
                  classType: decodedLegend.type === 'qual'? 'mostfrequent': 'qualitative',
                  colors: decodedLegend.items.map(item=>item.paint[paintPropertyName]),
                  hideNulls: false,
                  outlines: true,
                  reversed: false,
                  colorSchemeType: 'qual',
                  noNulls: this.stats.nullrowcount == 0 || this.stats.datarowcount == 0,
                  noEqual: decodedLegend.type === 'qual',
                  noMostFrequent: this.stats.allvaluesunique
                };
              }
            }
        }
        return true;
    }
    render() {
        if (!this.legendConfig) {
          return html``;
        }
        return html`
        <map-layer-config-legend 
          .classCount="${this.legendConfig.classCount}"
          .classType="${this.legendConfig.classType}"
          .hideNulls="${this.legendConfig.hideNulls}"
          .outlines="${this.legendConfig.outlines}"
          .reverseColors="${this.legendConfig.reverseColors}"
          .colorSchemeType="${this.legendConfig.colorSchemeType}"
          .noEqual="${this.legendConfig.noEqual}",
          .noNulls="${this.legendConfig.noNulls}"
          .noMostFrequent="${this.legendConfig.noMostFrequent}",
          .inputColors="${this.legendConfig.colors.slice(0)}",
          @change="${(e)=>this._handleChange(e)}"
        ></map-layer-config-legend>
        `
    }
    _getLegendInfoFromLayer() {
        let paint = this.layer.metadata.paint ? this.layer.metadata.paint : this.layer.paint;
        let paintStyle = paint[`${this.layer.type}-color`];
        let legendInfo = mbStyleParser.paintStyleToLegendItems(paintStyle, this.layer.type, this.zoom, this.layerTitle);
        console.log(legendInfo);
        return legendInfo;
    }
    _updateMapProperty(paintProperty) {
      let clonedProperty = Object.assign({}, paintProperty);
      clonedProperty.layerid = this.layer.id;
      this.dispatchEvent(new CustomEvent('changepaintproperty', {
        detail: clonedProperty,
        bubbles: true,
        composed: true,
      }));
    }
    _handleChange(event) {
      let newLegendConfig = event.detail;
      let classInfo = classify(this.stats, newLegendConfig.classCount, newLegendConfig.classType, newLegendConfig.colors);
      console.log(classInfo);
      let paintLegend = createPaint(this.layer.type, this.stats, classInfo, newLegendConfig);
      let displayOutlines = newLegendConfig.outlines;
      switch (this.layer.type) {
        case 'fill':
          this._updateMapProperty({'fill-outline-color': displayOutlines? 'white':null});
          this._updateMapProperty({'fill-color': 'yellow'}); // fix for mapbox-gl update bug?
          break;
        case 'line':
          break;
        case 'circle':
          this._updateMapProperty({'circle-stroke-width': displayOutlines? 1:0});
          this._updateMapProperty({'circle-stroke-color': displayOutlines? 'white':null});
          break;
      }
      // update colors
      let paintProperty = {};
      paintProperty[`${this.layer.type}-color`] = paintLegend;
      this._updateMapProperty(paintProperty);
      if (this.legendConfig.hideNulls !== newLegendConfig.hideNulls) {
        // filter changed
        this._updateNullFilter(newLegendConfig.hideNulls);
      }
      // store legend information in metadata
      this.legendConfig = newLegendConfig;
      this.layer.metadata.paint = Object.assign({}, this.layer.paint, this.layer.metadata.paint, paintProperty);
      this.layer.metadata.legendConfig = newLegendConfig;
      this.layer.metadata.stats = this.stats;
      
    }
    _updateNullFilter(hideNulls) {
      let filter;
      if (hideNulls) {
        // add filter to hide null values
        filter = ["!=", ["get", this.stats.column], null];
        if (this.initialFilter) {
          filter = ["all", filter, this.initialFilter]
        }
      } else {
        // restore original filter
        filter = this.initialFilter;
      }
      this.dispatchEvent(new CustomEvent('changefilter', {
        detail: {layerid: this.layer.id, filter: filter},
        bubbles: true,
        composed: true
      }))
    }
    _sortFunction(a, b) {
      if (typeof a === "number") {
        return a - b;
      }
      if (a === b) {
        return 0;
      }
      if (a === null || a === undefined) {
        return -1;
      }
      if (b === null || b === undefined) {
        return 1;
      }
      if (typeof a === 'string' && typeof b === "string") {
        if (a.toLowerCase() < b.toLowerCase()) {
          return - 1;
        }
      }
      if (a < b) {
        return - 1;
      }
      return 1;
    }
    _getMostFrequentValues(sortedData) {
      let buckets = [];
      for (let i = 0; i < 100; i++) {
        buckets[i] = {count: 0, value: undefined}
      }
      let thisValue;
      let valueCount = 0;
      let smallestBucket = 0;
      for (let row = 0; row < sortedData.length; row++) {
        if (sortedData[row] !== thisValue || row === sortedData.length - 1) {
          // new value found
          if (row === sortedData.length - 1) {
            // last item
            valueCount++;
          }
          if (valueCount > buckets[smallestBucket].count) {
            buckets[smallestBucket] = {count: valueCount, value: thisValue}
            // reset smallest bucket
            for (let b = 0; b < buckets.length; b++) {
              if (buckets[b].count < buckets[smallestBucket].count) {
                smallestBucket = b;
              }
            }
          }
          thisValue = sortedData[row];
          valueCount = 1;
        } else {
          valueCount ++;
        }
      }
      return buckets.filter(bucket=>bucket.count > 0)
        .map(bucket=>{
            if (bucket.value===undefined) {
              bucket.value = null;
            }
            return bucket;
        }).sort((a,b)=>b.count-a.count);
    }
    _getPercentiles(sortedData) {
      let data = sortedData.filter(item=>item!==null && item!==undefined);
      let rowsPerPercentile = data.length / 100 < 1 ? 1 : data.length / 100;
      let percentiles = [];
      let startrow = 0;
      for (let p = 0; p < 100 && Math.round(p * rowsPerPercentile) < data.length; p++) {
        let endrow = Math.round((p + 1) * rowsPerPercentile) - 1;
        if (endrow > data.length - 1) {
          endrow = data.length - 1;
        }
        percentiles.push({from: data[startrow], to: data[endrow], count: 1 + endrow - startrow, percentile: p + 1});
        startrow = endrow + 1;
      }
      return percentiles;
    }
    _getTypeName(item) {
      let type = typeof item;
      if (type == 'object') {
        if (item === null) {
          type = 'null'
        } else if (Array.isArray(item)){
          type = 'array'
        }
      }
      return type;
    }
    _getDataProperties(attribute) {
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
      let scanLength = data.length > 400? 400: data.length;
      let attributes = new Map();
      for (let i = 0; i < scanLength; i++) {
        let keys = Object.keys(data[i].properties);
        for (let j = 0; j < keys.length; j++) {
          if (attributes.has(keys[j])) {
            if (attributes.get(keys[j]) === 'null') {
              if (data[i].properties[keys[j]] !== null) {
                attributes.set(keys[j], this._getTypeName(data[i].properties[keys[j]]));
              }
            }
          } else {
            attributes.set(keys[j], this._getTypeName(data[i].properties[keys[j]]));
          }
        }
      }
      if (!attribute) {
        attribute = Array.from(attributes.keys())[0];
      }
        let sortedData = data.map(item=>item.properties[attribute]).sort(this._sortFunction);
        let percentiles = this._getPercentiles(sortedData);
        let datarowcount = percentiles.reduce((result, percentile)=>result + percentile.count, 0);
        let stats = {
          allvaluesunique: false,
          attributes: Array.from(attributes.entries()),
          column: attribute,
          datarowcount: datarowcount,
          datatype: percentiles.length ? typeof percentiles[0].from : 'null',
          nullrowcount: sortedData.length - datarowcount,
          percentiles: percentiles,
          table: this.layer.id,
          uniquevalues: 100,
          values: this._getMostFrequentValues(sortedData)
        }
        return stats;
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