import {html, css, LitElement} from 'lit-element';
import './map-layer-config-legend.js';
import mbStyleParser from '../../../utils/mbox-style-parse.js';
import colorbrewer from '../../../lib/colorbrewer.js';
import classify from '../../../lib/classify.js';

// create a map layer definition from the legend and apply it to the map attribute layer
/**
 * 
 * @param {string} layerType 'fill', 'line' or 'circle'
 * @param {stats} stats 
 * @param {object} classInfo 
 * @param {object} legendConfig 
 */
function updateMap(layerType, stats, classInfo, legendConfig) {
  let mapboxPaint;
  switch(classInfo.classType) {
      case 'mostfrequent':
          mapboxPaint = ["case"];
          classInfo.classes.forEach(classItem=>{
              if (classItem.from !== '__other__') {
                  mapboxPaint.push(['==', ["get", stats.column], classItem.from]);
                  mapboxPaint.push(classItem.paint);
              }
          })
          mapboxPaint.push(classInfo.classes[classInfo.classCount - 1].paint);
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
  if (mapboxPaint) {
      let displayOutlines = legendConfig.outlines;
      switch (layerType) {
          case 'fill':
              map.setPaintProperty('attrlayer', 'fill-outline-color', displayOutlines? 'white':null);
              map.setPaintProperty('attrlayer', 'fill-color', 'yellow'); // fix for mapbox-gl update bug?
              break;
          case 'line':
              break;
          case 'circle':
              map.setPaintProperty('attrlayer', 'circle-stroke-width', displayOutlines? 1:0);
              map.setPaintProperty('attrlayer', 'circle-stroke-color', displayOutlines? 'white':null);
              break;
      }

      let colorprop = `${layerType}-color`;
      map.setPaintProperty('attrlayer', colorprop, mapboxPaint);

      updateLayerJsonDisplay();
  }
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
            this.layerTitle = this.layer.metadata && this.layer.metadata.title? this.layer.metadata.title:this.layer.id;
            this.legendInfo = this._getLegendInfoFromLayer();            
        }
        return true;
    }
    render() {
        let classCount = this.legendInfo.items.length; 
        let classType = this.legendInfo.type;
        return html`
        <map-layer-config-legend 
          .classCount="${classCount}"
          .classType="${classType}"
          @change="${(e)=>this._handleChange(e)}"
        ></map-layer-config-legend>
        `
    }
    _getLegendInfoFromLayer() {
        let paint = this.layer.metadata.paint ? this.layer.metadata.paint : this.layer.paint;
        let paintStyle = paint["fill-color"];
        let legendInfo = mbStyleParser.paintStyleToLegendItems(paintStyle, 'fill', this.zoom, this.layerTitle);
        console.log(legendInfo);
        let dataProperties = this._getDataProperties();
        console.log(dataProperties);
        return legendInfo;
    }
    _handleChange(event) {
      let legendConfig = event.details;
      let classInfo = classify(stats, legendConfig.classCount, legendConfig.classType, legendConfig.colors);
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
      return buckets.filter(bucket=>bucket.count > 0).sort((a,b)=>b.count-a.count);
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
        //const minmax = this._getMinMax(data, stylePropertyName);
        //return {property: stylePropertyName, minmax: minmax, values: data.map(item=>item.properties[stylePropertyName])}
        let sortedData = data.map(item=>item.properties[stylePropertyName]).sort(this._sortFunction);
        let percentiles = this._getPercentiles(sortedData);
        let datarowcount = percentiles.reduce((result, percentile)=>result + percentile.count, 0);
        let stats = {
          allvaluesunique: false,
          column: stylePropertyName,
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
    _searchPaintForProperty(paint) {
      if (Array.isArray(paint)) {
        if (paint.length === 2 && paint[0] === "get") {
          return paint[1];
        }
        return paint.reduce((result, item)=>{
          if (!result) {
            let search = this._searchPaintForProperty(item);
            if (search) {
              result = search;
            }
          }
          return result;
        }, false);
      }
      return false;
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
          if (paint[0] === "step" || paint[0] === "match") {
            if (paint[1][0] === "get") {
              return paint[1][1];
            }
          }
          if (paint[0] === "case") {
            let condition = paint[1];
            for (item of condition) {
              if (item.length === 2 && item[0] === "get") {
                return item[1];
              }
            }
          }
          let search = this._searchPaintForProperty(paint);
          if (search) {
            return search;
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