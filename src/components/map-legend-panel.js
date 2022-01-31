/* map-legend-panel
   Visual container that displays the layer legend or a message that no legend is available.
   If the layer style is editable, this container also provides buttons to access layer-legend edit dialogs
*/

import {LitElement, html, svg, css} from 'lit-element';
import mbStyleParser from '../utils/mbox-style-parse.js';
//import MbStyleParser2 from '../utils/mbox-style-parse2.js'
import './map-legend-item-edit';
import './map-legend-line';
import './map-legend-fill';
import './map-legend-circle';
import './map-legend-symbol';

/**
* @polymer
* @extends HTMLElement
*/
class MapLegendPanel extends LitElement {
  static get properties() { 
    return { 
      legendurl: {type: String},
      zoom: {type: Number},
      maplayer: {type: Object},
      transparency: {type: Number},
      updatelegend: { type: Number},
      activeEdits: {type: Object}
    }; 
  }
  static get styles() {
    return css `
      :host {
        display: block;
      }
      .legendcontainer {
        text-align: left;
        padding-left: 5px;
        background: white;
        overflow: hidden;
      }
      .legendcontainer img {
        max-width: calc(100% - 3px);
      }
      .hidden {
        display: none;
      }`
  }
  constructor() {
      super();
      this.transparency = 0;
      this.updatelegend = 0;
      this.activeEdits = {};
  }
  shouldUpdate(changedProperties) {
    if (changedProperties.has('maplayer')) {
      if (this.maplayer && this.maplayer.metadata && this.maplayer.hasOwnProperty('transparency')) {
        this.transparency = this.maplayer.metadata.transparency;
      } else {
        this.transparency = 0;
      }
    }
    return true;
  }
  _legendReady() {
    this.dispatchEvent(new CustomEvent('load', {}));
  }
  fixedLegend(maplayer)
  {
    if (maplayer.metadata && maplayer.metadata.legendurl) {
      return html`<img @load="${()=>this._legendReady()}" src="${maplayer.metadata.legendurl}">`;
    }
  }
  lineLegend(maplayer) {
    if ((maplayer.hasOwnProperty('minzoom') && maplayer.minzoom > this.zoom) || (maplayer.hasOwnProperty('maxzoom') && maplayer.maxzoom < this.zoom)) {
      return html``;
    }
    let layerTitle = maplayer.metadata.title?maplayer.metadata.title:maplayer.id;
    const widthResult = {propertyname: layerTitle, items: []};
    const colorResult = {propertyname: layerTitle, items: []};
    
    let lineColor = "gray";
    let lineWidth = 1;
    if (maplayer._paint) {
      if (maplayer._paint._values) {
        const values = maplayer._paint._values;
        if (values["line-color"]) {
          if (values["line-color"].value.kind === "constant") {
            const rgba = values["line-color"].value.value;
            lineColor = `rgba(${rgba.r * 255},${rgba.g * 255},${rgba.b * 255},${rgba.a})`;
            colorResult.items.push({lineColor: lineColor, width: 2, label: layerTitle});
          } else if (values["line-color"].value.kind === "source") {
            let outputs = values["line-color"].value._styleExpression.expression.outputs ? 
                              values["line-color"].value._styleExpression.expression.outputs : 
                                values["line-color"].value._styleExpression.expression.possibleOutputs ?
                                values["line-color"].value._styleExpression.expression.possibleOutputs() :
                                  [];
            colorResult.items = outputs.map(output=>`rgba(${output.r * 255}, ${output.g * 255}, ${output.b * 255}, ${output.a})`)
              .map((color, index)=>{
                let expression = values["line-color"].value._styleExpression.expression;
                return {lineColor:color, width: 2, label: expression.labels?expression.labels[index]:expression.cases?Object.keys(expression.cases)[index]:'unknown'}
              })
          }
        }
        if (values["line-width"]) {
          if (values["line-width"].value.kind === "constant") {
            const lineWidth = values['line-width'].value.value;
            widthResult.items.push({
              lineWidth: lineWidth, 
              lineColor: colorResult.items.length == 1 ? colorResult.items[0].lineColor: colorResult.items[Math.floor(colorResult.items.length/2)].lineColor, 
              label: layerTitle
            });
          } else {
            if (values["line-width"].value.kind === "source") {
              let outputs = values["line-width"].value._styleExpression.expression.outputs ? 
                              values["line-width"].value._styleExpression.expression.outputs : 
                                values["line-width"].value._styleExpression.expression.possibleOutputs ?
                                values["line-width"].value._styleExpression.expression.possibleOutputs() :
                                  [];
              widthResult.items = outputs.map(output=>output.value)
              .map((width, index)=>{                
                let expression = values["line-width"].value._styleExpression.expression;
                return {
                    lineWidth:width, 
                    lineColor: colorResult.items.length == 1 ? colorResult.items[0].lineColor: colorResult.items[Math.floor(colorResult.items.length / 2)].lineColor, 
                    label: expression.labels? expression.labels[index] : expression.cases?Object.keys(expression.cases)[index]: 'unknown'
                  }
              })
            }
          }
        }
        colorResult.items = colorResult.items.map(item=>{
          item.width = widthResult.items.length == 1 ? widthResult.items[0].lineWidth : widthResult.items[Math.floor(widthResult.items.length / 2)].lineWidth;
          return item;
        });
        if (colorResult.items.length == 1) {
          // only one legend item in layer
          if (colorResult.items[0].label === '') {
            colorResult.items[0].label = colorResult.propertyname;
          }
          colorResult.propertyname = null;
        }
        if (widthResult.items.length == 1) {
          // only one legend item in layer
          if (widthResult.items[0].label === '') {
            widthResult.items[0].label = widthResult.propertyname;
          }
          widthResult.propertyname = null;
        }
        if (colorResult.items.length > 1 && widthResult.items.length > 1) {
          return html`
          <style>
            .twocolumn {
              display: flex;
              justify-content: space-between;
            }
          </style> 
          ${colorResult.propertyname?html` ${colorResult.propertyname}<br>`:''}
          <div class="twocolumn">
          <div>${colorResult.items.map(color=>{
            return svg`<svg width="30" height="15">
            <line x1="0" y1="15" x2="30" y2="0" style="stroke:${color.lineColor};stroke-width:${color.width};" />
            </svg>${html` ${color.label}<br>`}`
          })}</div>
          <div>${widthResult.items.map(width=>{
            return svg`<svg width="30" height="15">
            <line x1="0" y1="15" x2="30" y2="0" style="stroke:${width.lineColor};stroke-width:${width.lineWidth};" />
            </svg>${html` ${width.label}<br>`}`
          })}</div>
          </div>`
        }
        if (colorResult.items.length > 1) {
          return html`
          <div>${colorResult.propertyname?html` ${colorResult.propertyname}<br>`:''}
          ${colorResult.items.map(color=>{
            const legendItem = svg`<svg width="30" height="15">
            <line x1="0" y1="15" x2="30" y2="0" style="stroke:${color.lineColor};stroke-width:${color.width};" />
            </svg>${html` ${color.label}`}`;
            return html`
            <map-legend-item-edit .layerid="${maplayer.id}" .color=${width.lineColor} .width=${color.width} @change="${this._updatePaintProperty}">
              ${legendItem}
          </map-legend-item-edit>`
          })}</div>`
        }
        return html`
          <div>
          ${widthResult.propertyname?html` ${widthResult.propertyname}<br>`:''}
          ${widthResult.items.map(width=>{
            const legendItem = svg`<svg width="30" height="15">
            <line x1="0" y1="15" x2="30" y2="0" style="stroke:${width.lineColor};stroke-width:${width.lineWidth};" />
            </svg>${html` ${width.label}`}`;
            return html`<map-legend-item-edit @change="${this._updatePaintProperty}" .layerid="${maplayer.id}" .color=${width.lineColor} .width=${width.lineWidth} @change="${this._updatePaintProperty}">${legendItem}</map-legend-item-edit>`
          })}</div>`
      }
    } else {
      const paint = maplayer.paint;
      if (paint && paint['line-color']) {
        lineColor = paint['line-color'];
      }
      if (paint && paint['line-width']) {
        lineWidth = paint['line-width'];
      }
      if (lineWidth === Object(lineWidth)) {
        if (lineWidth.stops) {
          let minWidth = 1;
          let maxWidth = 1;
          let prevZoom = 0;
          for (let i = 0; i < lineWidth.stops.length; i++) {
            if (this.zoom <= lineWidth.stops[i][0]) {
              maxWidth = lineWidth.stops[i][1];
              lineWidth = (maxWidth - minWidth) * (this.zoom - prevZoom)/(lineWidth.stops[i][0] - prevZoom);
              break;
            } else {
              minWidth = lineWidth.stops[i][1];
              prevZoom = lineWidth.stops[i][0];
            }
          }
        }
      }
      if (Array.isArray(lineWidth)) {

      }
    }
    if (!Array.isArray(lineColor)) {
      lineColor = [lineColor];
    }
    return svg`${lineColor.map((color, index)=>{
        return svg`<svg width="30" height="15">
        <line x1="0" y1="15" x2="30" y2="0" style="stroke:${color};stroke-width:${lineWidth};" />
        </svg>`;
      })}`
  }

  circleRadiusLegend(radiusInfo) {
    if (radiusInfo.items.length > 1) {
      return radiusInfo.items.map(radius=>
          svg`
            <svg width="${radiusInfo.items[0].value*2+2}" height="${radiusInfo.items[0].value*2+2}">
            <circle cx="${radiusInfo.items[0].value+1}" cy="${radiusInfo.items[0].value+1}" r="${radiusInfo.items[0].value}" style="fill:red;" />
            </svg>
          `
        );
    }
  }
  circleColorLegend(colorInfo, strokeInfo, radiusInfo, opacityInfo) {
    return html`${colorInfo.propertyname?html` ${colorInfo.propertyname}<br>`:''}
      ${colorInfo.items.filter(item=>(item.label && item.label.trim() !== "")).map((color,index)=>{
        let radiusIndex = radiusInfo.items.length === colorInfo.items.length? index : 0;
        if (radiusInfo.items.length === 0) {
          return html`items: 0?`;
        }
        return html`
          ${svg`
            <svg width="${radiusInfo.items[radiusIndex].value*2+2}" height="${radiusInfo.items[radiusIndex].value*2+2}">
            <circle cx="${radiusInfo.items[radiusIndex].value+1}" cy="${radiusInfo.items[radiusIndex].value+1}" r="${radiusInfo.items[radiusIndex].value}" style="fill:${color.value};${opacityInfo.items.length?`fill-opacity:${opacityInfo.items[0].value};`:''}${strokeInfo.items.length?`stroke-width:1;stroke:${strokeInfo.items[0].value}`:''}" />
            </svg> 
          `}
        ${color.label}<br>
        `
      })}`
      ;
  }
  circleLegend(maplayer) {
    const paint = maplayer.metadata.paint ? maplayer.metadata.paint : maplayer.paint;
    let colorInfo = {propertyname: maplayer.metadata.title, items: ['white'] };
    if (paint && paint['circle-color']) {
      colorInfo = mbStyleParser.getZoomDependentPropertyInfo(this.zoom, paint['circle-color'], maplayer.metadata.title);
    }
    let opacityInfo = {propertyname: maplayer.metadata.title, items: []};
    if (paint && paint['circle-opacity']) {
      opacityInfo = mbStyleParser.getZoomDependentPropertyInfo(this.zoom, paint['circle-opacity'], maplayer.metadata.title);
      if (opacityInfo.items.length > 1) {
        // not supported
        opacityInfo.items = [];
      }
    }
    let radiusInfo = {propertyname: maplayer.metadata.title, items: [{value:5}]};
    if (paint && paint['circle-radius']) {
      radiusInfo = mbStyleParser.getZoomDependentPropertyInfo(this.zoom, paint['circle-radius'], maplayer.metadata.title);
    }
    let strokeInfo = {propertyname: maplayer.metadata.title, items: []};
    if (paint && paint['circle-stroke-color'] && paint['circle-stroke-width']) {
      strokeInfo = mbStyleParser.getZoomDependentPropertyInfo(this.zoom, paint['circle-stroke-color'], maplayer.metadata.title);
      if (strokeInfo.items.length > 1) {
        // not supported
        strokeInfo.items = [];
      }
    }
    
    if (radiusInfo.items.length !== colorInfo.items.length) {
      radiusInfo = this.translateResult(maplayer, radiusInfo);
      colorInfo = this.translateResult(maplayer, colorInfo);
      return html`
      ${this.circleColorLegend(colorInfo, strokeInfo, radiusInfo, opacityInfo)}
      ${this.circleRadiusLegend(radiusInfo)}
    `
    } else {
      colorInfo = this.translateResult(maplayer, colorInfo);
      return this.circleColorLegend(colorInfo, strokeInfo, radiusInfo, opacityInfo);
    }
    
  }
  
  filleExtrusionLegend(maplayer) {
    let layerTitle = maplayer.metadata.title?maplayer.metadata.title:maplayer.id;
    let result = {propertyname: layerTitle, items: []};
    const paint = maplayer.metadata.paint ? maplayer.metadata.paint : maplayer.paint;
    let paintFillColor;
    if (paint && paint['fill-extrusion-color']) {
      paintFillColor = mbStyleParser.getZoomDependentValue(this.zoom, paint['fill-extrusion-color']);
    }
    if (Array.isArray(paintFillColor) && paintFillColor.length) {
      switch(paintFillColor[0]) {
        case "step":
          // element[1] is ["get", "propertyname"] (?)
          result.propertyname = mbStyleParser.searchPaintForProperty(paintFillColor);
          result.items.push({fillColor: paintFillColor[2], label: `< ${paintFillColor[3]}`});
          for (let i = 3; i < paintFillColor.length - 2; i+=2) {
            // get color
            result.items.push({fillColor: paintFillColor[i+1], label: `[${paintFillColor[i]} - ${paintFillColor[i+2]})`});
          }
          result.items.push({fillColor: paintFillColor[paintFillColor.length - 1], label: `> ${paintFillColor[paintFillColor.length - 2]}`})
          break;
        case "match":
          // element[1] is ["get", "propertyname"] (?)
          result.propertyname = mbStyleParser.searchPaintForProperty(paintFillColor);
          result.items.push({fillColor: paintFillColor[paintFillColor.length - 1], label: ''});
          for (let i = 2; i < paintFillColor.length - 1; i+=2) {
            result.items.push({fillColor: paintFillColor[i+1], label: `${paintFillColor[i]}`});
          }
          break;
        case "case":
          result.propertyname = mbStyleParser.searchPaintForProperty(paintFillColor);
          result.items.push({fillColor: paintFillColor[paintFillColor.length - 1], label: ''});
          for (let i = 1; i < paintFillColor.length - 1; i+=2) {
            result.items.push({fillColor: paintFillColor[i+1], label: `${paintFillColor[i][2]}`});
          }
          break;
      }
    } else if (paintFillColor === Object(paintFillColor)) {
      if (paintFillColor.hasOwnProperty('property')) {
        result.propertyname = paintFillColor.property;
        if (paintFillColor.stops) {
          result.items = paintFillColor.stops.map(stop=>{return {fillColor:stop[1], label: stop[0]}});
        }
      }
    } else if (typeof paintFillColor === "string") {
      result.propertyname = '';
      result.items.push({fillColor: paintFillColor, label: layerTitle});
    }
    if (result.items.length == 1) {
      // only one legend item in layer
      if (result.items[0].label === '') {
        result.items[0].label = result.propertyname;
      }
      result.propertyname = null;
    }
    result = this.translateResult(maplayer, result);
    return html`${result.propertyname?html` ${result.propertyname}<br>`:''}
      ${result.items.filter(item=>(item.label && item.label.toString().trim() !== "")).map((item)=>{
        return svg`
        <svg width="30" height="15">
          <rect width="30" height="15" style="fill:${item.fillColor};fill-opacity:1;stroke-width:1;stroke:#cccccc"/>
        </svg>${html` ${item.label}<br>`}`;
      })}`;
  }
  fillLegend(maplayer)
  {
    // legend should have one or more items
    // single item if:
    // legend value is string OR legend value is zoom dependent string
    // convert to array of {propertyname, [{fillColor, outlineColor, label}]}
    let layerTitle = maplayer.metadata.title?maplayer.metadata.title:maplayer.id;
    let result = {propertyname: layerTitle, items: []};
    const paint = maplayer.metadata.paint ? maplayer.metadata.paint : maplayer.paint;
    let paintFillColor = "white";
    if (paint && paint['fill-color']) {
      paintFillColor = mbStyleParser.getZoomDependentValue(this.zoom, paint['fill-color']);
    }
    let outlineColor = "gray";
    if (paint && paint['fill-outline-color']) {
      outlineColor = mbStyleParser.getZoomDependentValue(this.zoom, paint['fill-outline-color']);
    }
    // todo: get more complex outlinecolor if applicable
    if (typeof outlineColor !== 'string') {
      outlineColor = "gray";
    }
    let fillOpacity = 1;
    if (paint && paint['fill-opacity']) {
      fillOpacity = mbStyleParser.getZoomDependentValue(this.zoom, paint['fill-opacity']);
    }
    if (typeof fillOpacity !== 'number') {
      fillOpacity = 1;
    }
    if (Array.isArray(paintFillColor) && paintFillColor.length) {
      switch(paintFillColor[0]) {
        case "step":
          // element[1] is ["get", "propertyname"] (?)
          result.propertyname = mbStyleParser.searchPaintForProperty(paintFillColor);
          result.items.push({fillColor: paintFillColor[2], outlineColor: outlineColor, fillOpacity: fillOpacity, label: `< ${paintFillColor[3]}`});
          for (let i = 3; i < paintFillColor.length - 2; i+=2) {
            // get color
            result.items.push({fillColor: paintFillColor[i+1], outlineColor: outlineColor, fillOpacity: fillOpacity, label: `[${paintFillColor[i]} - ${paintFillColor[i+2]})`});
          }
          result.items.push({fillColor: paintFillColor[paintFillColor.length - 1], outlineColor, fillOpacity: fillOpacity, label: `> ${paintFillColor[paintFillColor.length - 2]}`})
          break;
        case "match":
          // element[1] is ["get", "propertyname"] (?)
          result.propertyname = mbStyleParser.searchPaintForProperty(paintFillColor);
          result.items.push({fillColor: paintFillColor[paintFillColor.length - 1], outlineColor: outlineColor, fillOpacity: fillOpacity, label: ''});
          for (let i = 2; i < paintFillColor.length - 1; i+=2) {
            result.items.push({fillColor: paintFillColor[i+1], outlineColor: outlineColor, fillOpacity: fillOpacity, label: `${paintFillColor[i]}`});
          }
          break;
        case "case":
          result.propertyname = mbStyleParser.searchPaintForProperty(paintFillColor);
          result.items.push({fillColor: paintFillColor[paintFillColor.length - 1], outlineColor: outlineColor, fillOpacity: fillOpacity, label: ''});
          for (let i = 1; i < paintFillColor.length - 1; i+=2) {
            result.items.push({fillColor: paintFillColor[i+1], outlineColor: outlineColor, fillOpacity: fillOpacity, label: `${paintFillColor[i][2]}`});
          }
          break;
      }
    } else if (paintFillColor === Object(paintFillColor)) {
      if (paintFillColor.hasOwnProperty('property')) {
        result.propertyname = paintFillColor.property;
        if (paintFillColor.stops) {
          result.items = paintFillColor.stops.map(stop=>{return {fillColor:stop[1], outlineColor: outlineColor, fillOpacity: fillOpacity, label: stop[0]}});
        }
      }
    } else if (typeof paintFillColor === "string") {
      result.propertyname = '';
      result.items.push({fillColor: paintFillColor, outlineColor: outlineColor, label: layerTitle});
    }
    if (result.items.length == 1) {
      // only one legend item in layer
      if (result.items[0].label === '') {
        result.items[0].label = result.propertyname;
      }
      result.propertyname = null;
    }
    result = this.translateResult(maplayer, result);
    return html`${result.propertyname?html` ${result.propertyname}<br>`:''}
      ${result.items.filter(item=>(item.label && item.label.trim() !== "")).map((item)=>{
        return svg`
        <svg width="30" height="15">
          <rect width="30" height="15" style="fill:${item.fillColor};fill-opacity:${fillOpacity};stroke-width:1;stroke:${item.outlineColor}"/>
        </svg>${html` ${item.label}<br>`}`;
      })}`;
  }
  translateResult(maplayer, result) {
    if (maplayer.metadata && maplayer.metadata.attributes && maplayer.metadata.attributes.translations) {
      let attributes = maplayer.metadata.attributes;
      for (let translation of attributes.translations) {
        if (translation.name === result.propertyname) {
          if (translation.translation) {
            result.propertyname = translation.translation;
          }
          if (translation.unit && translation.unit !== "") {
            for (let item of result.items) {
              if (item.label && item.label !== "") {
                item.label += translation.unit;
              }
            }
          }
        }
      }
    }
    return result;
  }
  backgroundLegend(maplayer) {
    let bgColor = maplayer.paint["background-color"];
    let bgOpacity = maplayer.paint["background-opacity"]?maplayer.paint["background-opacity"]:1;
    return svg`
        <svg width="30" height="15">
          <rect width="30" height="15" style="fill:${bgColor};fill-opacity:${bgOpacity};stroke-width:1;stroke:black"/>
        </svg>${html` kaartachtergrond<br>`}`;
  }
  getUserLegend(maplayer) {
    let classInfo = maplayer.metadata.classInfo;
    switch(maplayer.type) {
      case 'fill':
          return classInfo.classes.map((item,index)=>{
            return svg`
              <svg width="30" height="15">
                <rect id="${maplayer.id} ${index}" width="30" height="15" style="fill:${item.paint};fill-opacity:1;stroke-width:1;stroke:#cccccc"/>
              </svg>${html` ${item.label}<br>`}`;
          })
        break;
      case 'line':
        break;
      case 'circle':
          let radius = 5;
          return classInfo.classes.map((item,index)=>{
            return svg`
              <svg width="${radius*2+2}" height="${radius*2+2}">
                <circle id="${maplayer.id} ${index}" cx="${radius+1}" cy="${radius+1}" r="${radius}" style="fill:${item.paint};fill-opacity:1;stroke-width:1;stroke:white}" />
              </svg> 
            ${item.label}<br>
            `
          })
        break;
      default: 
        return `unsupported user layer: ${maplayer.type}`
    }
  }
  _translateItems(items, translation) {
    for (const item of items) {
      if (translation.name === item.attrName) {
        item.attrName = translation.translation;
        if (translation.hasOwnProperty('decimals') && !isNaN(parseInt(translation.decimals))) {
          if (typeof parseFloat(item.attrValue) == "number" && !isNaN(parseFloat(item.attrValue))) {
            let factor = Math.pow(10, parseInt(translation.decimals));
            item.attrValue = parseInt(Math.round(parseFloat(item.attrValue) * factor)) / factor;
          }
        }
        if (translation.unit && translation.unit !== "") {
          item.attrValue = `${item.attrValue}${translation.unit}`
        }
      }
    }
  }
  _addExpressionOperatorsToValues(items) {
    for (const item of items) {
      if (item.hasOwnProperty('attrValue')) {
        switch (item.attrExpression) {
          case '<=':
          case '>=':
          case '<':
          case '>':
            item.attrValue = item.attrExpression + item.attrValue;
            break;
          case '!=':
            item.attrValue = 'niet ' + item.attrValue;
            break;
          case undefined:
          case null:
          case '==':
            break;
          default:
            console.warn(`addEpressionOperatorsToValues: not yet implemented: ${item.attrExpression}`);
        }
      }
    }
  }
  _formatItems(maplayer, items) {
    if (maplayer.metadata && maplayer.metadata.attributes && maplayer.metadata.attributes.translations) {
      let attributes = maplayer.metadata.attributes;
      for (let translation of attributes.translations) {
        this._translateItems(items.colorItems, translation);
        this._translateItems(items.radiusItems, translation);
        this._translateItems(items.strokeColorItems, translation);
        this._translateItems(items.strokeWidthItems, translation);
      }
    }
    this._addExpressionOperatorsToValues(items.colorItems);
    this._addExpressionOperatorsToValues(items.radiusItems);
    this._addExpressionOperatorsToValues(items.strokeColorItems);
    this._addExpressionOperatorsToValues(items.strokeWidthItems);
  }
  getLegendContent(maplayer) {
    if (maplayer && maplayer.metadata && maplayer.metadata.hidelegend) {
      return html``;
    }
    if ((maplayer.hasOwnProperty('minzoom') && maplayer.minzoom > this.zoom) || (maplayer.hasOwnProperty('maxzoom') && maplayer.maxzoom < this.zoom)) {
      return html``;
    }
    let legendContent = html`legenda niet beschikbaar`;
    if (maplayer.metadata && maplayer.metadata.classInfo) {
      return this.getUserLegend(maplayer)
    }
    if (maplayer.metadata && maplayer.metadata.legendurl) {
      return this.fixedLegend(maplayer);
    }
    if (!this.activeEdits.hasOwnProperty(maplayer.id)) {
      this.activeEdits[maplayer.id] = maplayer.metadata.activeEdits ? maplayer.metadata.activeEdits : [];
    }
    const layerTitle = maplayer.metadata && maplayer.metadata.title?maplayer.metadata.title:maplayer.id;
    const items = mbStyleParser.legendItemsFromLayer(maplayer, layerTitle, this.zoom);
    this._formatItems(maplayer, items);
    switch(maplayer.type) {
      case 'raster':
        legendContent = this.fixedLegend(maplayer);
        break;
      case 'fill':
        //legendContent = this.fillLegend(maplayer, items);
        if (maplayer.paint && maplayer.paint["fill-pattern"]) {
          legendContent = legendContent = html`<map-legend-symbol 
            title="${layerTitle}" 
            .symbols="${maplayer.metadata.imageData}"></map-legend-symbol>`
        } else {
          legendContent = html`<map-legend-fill 
            @activeEdits=${this._layerSetActiveEdits}
            @change="${this._updatePaintProperty}"
            .activeEdits = "${this.activeEdits[maplayer.id]}"
            .items="${items}"
            title="${layerTitle}"
            layerid="${maplayer.id}"></map-legend-fill>`
        }
        break;
      case 'fill-extrusion':
        //legendContent = this.filleExtrusionLegend(maplayer, items);
        legendContent = html`<map-legend-fill 
          @activeEdits=${this._layerSetActiveEdits} 
          @change="${this._updatePaintProperty}" 
          .activeEdits = "${this.activeEdits[maplayer.id]}"
          .items="${items}" 
          title="${layerTitle}" 
          layerid="${maplayer.id}"></map-legend-fill>`
        break;
      case 'line':
        //legendContent = this.lineLegend(maplayer, items);
        legendContent = html`<map-legend-line 
          @activeEdits=${this._layerSetActiveEdits} 
          @change="${this._updatePaintProperty}"
          .activeEdits = "${this.activeEdits[maplayer.id]}"
          .items="${items}" 
          title="${layerTitle}" 
          layerid="${maplayer.id}"></map-legend-line>`
        break;
      case 'circle':
        //legendContent = this.circleLegend(maplayer, items);
        legendContent = html`<map-legend-circle 
          @activeEdits=${this._layerSetActiveEdits}
          @change="${this._updatePaintProperty}"
          .activeEdits = "${this.activeEdits[maplayer.id]}"
          .items="${items}" 
          title="${layerTitle}" 
          layerid="${maplayer.id}"></map-legend-circle>`
        break;
      case 'style':
        if (maplayer.metadata && maplayer.metadata.sublayers && maplayer.metadata.sublayers.length) {
          legendContent = maplayer.metadata.sublayers.map(sublayer=>this.getLegendContent(sublayer));
        }
        break;
      case 'symbol':
        //legendContent = '';
        let fontSize = maplayer.layout["text-size"];
        if (fontSize && typeof fontSize !== 'number') {
          fontSize = mbStyleParser.getZoomDependentPropertyInfo(this.zoom,fontSize,layerTitle);
          if (fontSize.items && fontSize.items.length) {
            fontSize = fontSize.items[0].value;
          } else {
            fontSize = 12;
          }
        }
        let font = maplayer.layout["text-font"];
        if (Array.isArray(font)) {
          font = font.join(', ');
        }
        const fontColor=maplayer.paint?maplayer.paint["text-color"]?maplayer.paint["text-color"]:"#000":"#000";
        const textTransform = maplayer.layout && maplayer.layout["text-transform"]?`text-transform:${maplayer.layout["text-transform"]};`:''
        const fontStyle = `font-family:${font};font-size:${fontSize}px;color:${fontColor};${textTransform}`;
        legendContent = html`<map-legend-symbol
          @activeEdits=${this._layerSetActiveEdits}
          @change="${this._updatePaintProperty}"
          .activeEdits = "${this.activeEdits[maplayer.id]}"
          title="${layerTitle}"
          .symbols="${maplayer.metadata.imageData}"
          .fontStyle=${fontStyle}
          layerid="${maplayer.id}"></map-legend-symbol>`
        break;
      case 'background':
        //legendContent = this.backgroundLegend(maplayer);
        legendContent = html`<map-legend-fill 
          @activeEdits=${this._layerSetActiveEdits}
          @change="${this._updatePaintProperty}" 
          .activeEdits = "${this.activeEdits[maplayer.id]}"
          .items="${items}"
          title="${layerTitle}"
          layerid="${maplayer.id}"></map-legend-fill>`
        break;
      case 'heatmap':
      case 'hillshade':
      case 'sky':
      default:
        legendContent = html`<div>legenda niet beschikbaar voor type ${maplayer.type}</div>`;
    }
    return legendContent;
  }

  render()
  {
    let legendContent;
    if (this.maplayer && this.maplayer.type) {
      legendContent = this.getLegendContent(this.maplayer);
    } 
    return html`
      <div class="legendcontainer" style="opacity:${this.transparency?1-Math.round(this.transparency)/100:1};">${legendContent}</div>`;
  }
  _layerSetActiveEdits(event) {
    this.activeEdits[event.detail.layerid] = event.detail.activeEdits;
    this.maplayer.metadata.activeEdits = event.detail.activeEdits;
  }
  _uninterpolate(value, input, base, top, bottom) {
    const difference = top[0] - bottom[0]; 
    const progress = (input - bottom[0]);
    if (progress < 0.1) {
      bottom[1] = value;
      return;
    }
    if (base === 1) {
      // lineair reverse interpolation      
      top[1] = bottom[1] + (value - bottom[1]) / (progress / difference);
      if (top[1] < bottom[1] + 0.1) {
        top[1] = bottom[1] + 0.1;
      }
      return;
    }
    top[1] = bottom[1] + (value - bottom[1]) / (progress / difference);
  }
  _updatePaintValue(paint, itemIndex, value) {
    if (Array.isArray(paint)) {
      switch(paint[0]) {
        case 'case':
          paint[2 + (itemIndex*2)] = value;
          break;
        case 'match':
        case 'step':
          paint[3 + (itemIndex*2)] = value;
      }
    } else if (typeof(paint) === 'string') {
      paint = value;
    } else if (typeof(paint) === 'object' && paint !== undefined) {
      paint = value;
      /* if (!paint.property && paint.base)  {
        // zoom dependent value
        let i;
        for (i = 0; i < paint.stops.length - 1 && this.zoom >= paint.stops[i][0]; i++) {
          ;
        }
        this._uninterpolate(value, this.zoom, paint.base, paint.stops[i], paint.stops[i-1]);
      }*/
    }
    return paint;
  }
  _updatePaintProperty(event)
  {
    const paintProperty = {};
    const layerid = event.detail.layerid;
    const itemIndex = event.detail.itemIndex;
    const editLayer = this.maplayer.id === layerid ? this.maplayer : this.maplayer.metadata.sublayers.find(({id})=>id === layerid);
    paintProperty.layerid = editLayer.id;
    
    if (event.detail.color) {
      const propertyName = `${editLayer.type}-color`;
      const color = event.detail.color;
      let paintColor = editLayer.metadata.paint ? 
        editLayer.metadata.paint[propertyName] : 
          editLayer.paint[propertyName];
      paintProperty[propertyName] = this._updatePaintValue(paintColor, itemIndex, color);
    }
    if (event.detail.outlineColor) {
      const propertyName = editLayer.type === 'fill' ? 'fill-outline-color' : `${editLayer.type}-stroke-color`
      const color = event.detail.outlineColor;
      let paintColor = editLayer.metadata.paint ? 
        editLayer.metadata.paint[propertyName] : 
          editLayer.paint[propertyName];
      if (!paintColor) {
        if (editLayer.metadata.paint) {
          editLayer.metadata.paint[propertyName] = color;
        } else {
          editLayer.paint[propertyName] = color;
        }
        paintColor = color;
      }
      paintProperty[propertyName] = this._updatePaintValue(paintColor, itemIndex, color);
    }
    if (event.detail.width !== undefined) {
      const propertyName = editLayer.type === 'line' ? "line-width" : `${editLayer.type}-stroke-width`
      const width = event.detail.width;
      let paintWidth = editLayer.metadata.paint ? 
        editLayer.metadata.paint[propertyName] : 
          editLayer.paint[propertyName];
      if (!paintWidth) {
        if (editLayer.metadata.paint) {
          editLayer.metadata.paint[propertyName] = width;
        } else {
          editLayer.paint[propertyName] = width;
        }
      }
      paintProperty[propertyName] = this._updatePaintValue(paintWidth, itemIndex, width);
    }
    if (event.detail.radius !== undefined) {
      const propertyName = `${editLayer.type}-radius`
      const radius = event.detail.radius;
      let paintRadius = editLayer.metadata.paint ? 
        editLayer.metadata.paint[propertyName] : 
          editLayer.paint[propertyName];
      paintProperty[propertyName] = this._updatePaintValue(paintRadius, itemIndex, paintRadius);
    }
    if (event.detail.fontStyle) {
      const fontStyles = event.detail.fontStyle.split(';');
      const fontSize = fontStyles.find(style=>style.startsWith('font-size:')).slice(10,-2);
      const fontColor = fontStyles.find(style=>style.startsWith('color:')).slice(6);
      if (!this.maplayer.layout || this.maplayer.layout['text-size'] !== fontSize) {
        paintProperty["text-size"] = parseFloat(fontSize);
      }
      if (!this.maplayer.paint || this.maplayer.paint['text-color'] !== fontColor) {
        paintProperty["text-color"] = fontColor;
      }
    }
    this.dispatchEvent(new CustomEvent('changepaintproperty', {
      detail: paintProperty,
      bubbles: true,
      composed: true,
    }));
  }
}

customElements.define('map-legend-panel', MapLegendPanel);