import {html, css, LitElement} from 'lit-element';

import "../../base/base-arrow.js";
import "../../base/base-checkbox.js";
import "./map-layer-info.js";
import {GestureEventListeners} from '../../../../node_modules/@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import * as Gestures from '../../../../node_modules/@polymer/polymer/lib/utils/gestures.js';


/**
* @polymer
* @extends HTMLElement
*/
class MapLayer extends GestureEventListeners(LitElement) {
    static get properties() {
        return {
            layer: {type: Object},
            nolayer: {type: String},
            itemcontainer: {type: Object},
            itemscroller: {type: Object},
            open: {type: Boolean}
        }
    }
    static get styles() {
        return css`
            :host {
                display: inline-block;
                width: 100%;
                margin-bottom: 10px;
            }
            .mlcontainer {
                position: relative;
                border-radius: 5px;
                box-shadow: 1px 1px 4px 0 rgba(66,66,66,0.34);
                padding: 10px;
            }
            base-arrow {
                position: absolute;
                right: 10px;
                top: 13px;
            }
            base-checkbox { 
                position: relative;
                top: 3px;
            }
            .mltitle {
                padding-right: 10px;
            }
            .draghandle {
                cursor: move;
                user-select: none;
                background-color: rgba(255,255,255,0.5);
            }
            #layerinfo {
                position: relative;
                transition: height .5s ease-in-out;
            }
            .closed {
                height: 0;
                padding: 0;
                overflow: hidden;
            }
        `
    }
    constructor() {
        super();
        this.layer = "";
        this.nolayer = "no layers defined";
        this.open = false;
        this.itemcontainer = null;
        this.itemscroller = null;
    }
    shouldUpdate(changedProperties) {
        if (changedProperties.has('layer')) {
            if (this.layer && this.layer.id) {
                this.id = this.layer.id;
            } else {
                this.id = '__undefined_layer_'
            }
            if (this.layer && this.layer.metadata && this.layer.metadata.hasOwnProperty('maplayeropen')) {
                this.open = this.layer.metadata.maplayeropen;
            }
        }
        return true;
    }
    render() {
        if (!this.layer) {
            return html`
                <div class="mlcontainer">
                    <div class="mltitle">
                        ${this.nolayer}
                    </div>
                </div>        
            `
        } 
        if (this.layer && this.layer.metadata) {
            this.layer.metadata.maplayeropen = this.open;
        }
        return html`
        <div class="mlcontainer">
            <div class="mltitle${this.itemcontainer?' draghandle':''}">
                <base-checkbox checked title="toggle layer visibility"></base-checkbox>
                <span @click="${()=>this._toggleArrow()}">${this.layer.metadata?this.layer.metadata.title?this.layer.metadata.title:this.layer.id:this.layer.id}</span>
                <base-arrow ?open="${this.open}" @change="${e=>this._openChange(e)}">
            </div>
            <div id="layerinfo" class="${this.open?'':'closed'}">${this._renderLayerInfo()}</div>
        </div>
        `
    }
    firstUpdated(){
        let mltitle = this.shadowRoot.querySelector('.mltitle');
        Gestures.addListener(mltitle, 'track', (e)=>this._trackHandler(e))
    }
    _toggleArrow() {
        let arrow = this.shadowRoot.querySelector('base-arrow');
        if (arrow) {
            arrow.open = !arrow.open;
            this._openChange();
        }
    }
    _renderLayerInfo() {
        return html`<map-layer-info .layer="${this.layer}" ?open="${this.open}"></map-layer-info>`
    }
    _openChange() {
        const infoContainer = this.shadowRoot.querySelector('#layerinfo');
        if (infoContainer.classList.contains('closed')) {
            // open layerinfo
            infoContainer.style.height = 0;
            setTimeout(()=>infoContainer.style.height=infoContainer.scrollHeight + 'px', 100);
            setTimeout(()=>{
                infoContainer.classList.remove('closed');
                infoContainer.style.height = null;
                this.open = true;
            }, 600);
        } else {
            // close layerinfo
            infoContainer.style.height = infoContainer.scrollHeight + 'px';
            infoContainer.style.overflow = 'hidden';
            setTimeout(()=>infoContainer.style.height = 0, 100);
            setTimeout(()=>{
                infoContainer.classList.add('closed');
                infoContainer.style.height = null;
                infoContainer.style.overflow = null;
                this.open = false;
            }, 600);
        }
    }
    _scrollUp() {
        if (this.scrollingUp) {
          if (this.itemscroller.scrollTop > 1) {
            this.itemscroller.scrollTop--;
            this.startOffsetTop--;
            this.top--;
            this.stylepos=`top:${top}px;`;
            setTimeout(()=>this._scrollUp(), 100);
          } else {
            this.scrollingUp = false;
          }
        }
      }
      _scrollDown() {
        if (this.scrollingDown) {
          if (this.itemscroller.scrollTop < this.itemScrollerHeight - this.itemScrollerClientRect.height - 1) {
            this.itemscroller.scrollTop++;
            this.startOffsetTop++;
            this.top++;
            this.stylepos=`top:${top}px;`;
            setTimeout(()=>this._scrollDown(), 50);
          } else {
            this.scrollingDown = false;
          }
        }
      }
      _findSiblings(y, x){
        const siblings = Array.from(this.itemcontainer.children);
        if (!this.itemScrollerClientRect || 
            x > this.itemScrollerClientRect.left + this.itemScrollerClientRect.width + 20 ||
            x < this.itemScrollerClientRect.left - 20) {
          // cursor outside itemscroller
          return [];
        }
        let result = siblings.filter(elem=> {
            const elemClientRect = elem.getBoundingClientRect();
            return (y > elemClientRect.top && y < (elemClientRect.top + elemClientRect.height));
          });
        if (result.length) {
          result = result.slice(0,1);
          if (result[0] === this.itemcontainer.children[0]) {
            // cursor on first item
            const elemClientRect = result[0].getBoundingClientRect();
            if (y -elemClientRect.top < elemClientRect.height / 2) {
              // cursor on top half of first item
              result.push("top"); 
            } else {
              result.push("bottom");
            }
          }
        }
        return result;
      }
    _trackHandler(event) {
        if (!this.itemcontainer) {
          // container not defined
          return;
        }
        switch(event.detail.state) {
          case 'start':
            this.container = this.shadowRoot.querySelector('.mlcontainer');
            this.curHovering = null;
            this.startOffsetTop = this.container.offsetTop;// always zero?
            if (this.itemscroller) {
              this.itemScrollerHeight = this.itemscroller.scrollHeight;
              this.itemScrollerClientRect = this.itemscroller.getBoundingClientRect();
            }
            break;
          case 'track':
            //let top = this.startOffsetTop + event.detail.dy;
            let top = event.detail.dy;
            if (this.startOffsetTop + top < 0) {
                top = -this.startOffsetTop;
            }
            if (this.itemscroller) {
              if (event.detail.y < this.itemScrollerClientRect.top) {
                // pointer above scroller
                this.scrollingUp = true;
                this._scrollUp();
              } else {
                // stop scrolling
                this.scrollingUp = false;
              }
              if (event.detail.y > this.itemScrollerClientRect.top + this.itemScrollerClientRect.height) {
                // pointer below scroller
                this.scrollingDown = true;
                this._scrollDown();
              } else {
                this.scrollingDown = false;
              }
              if (top > this.itemScrollerHeight - 1) {
                top = this.itemScrollerHeight - 1;
              }
            }
            this.top = top;
            this.container.style.top=`${top}px`;
            const hovering  = this._findSiblings(event.detail.y, event.detail.x);
            if (hovering.length && hovering[0] !== this) {
              if (hovering[0] !== this.curHovering || hovering.length > 1) {
                if (this.curHovering) {
                  this.curHovering.style['border-top'] = '';
                  this.curHovering.style['border-bottom'] = '';
                }
                if (hovering.length > 1 && hovering[1] == "top") {
                  hovering[0].style['border-top'] = 'solid 4px black';
                } else {
                  hovering[0].style['border-bottom'] = 'solid 4px black';
                }
                this.curHovering = hovering[0];
              }
            } else {
              if (this.curHovering) {
                this.curHovering.style['border-top'] = '';
                this.curHovering.style['border-bottom'] = '';
                this.curHovering = null;
              }
            }
            break;
          case 'end':
            this.scrollingUp = false;
            this.scrollingDown = false;
            this.container.style.top = null;
            this.container = null;
            if (this.curHovering) {
                let beforeFirst = false;
                if (this.curHovering.style['border-top'].length) {
                    beforeFirst = true;
                }
                this.dispatchEvent(new CustomEvent('movelayer',
                {
                    detail: {
                        layer: this.id, 
                        beforeLayer: this.curHovering.id, 
                        beforeFirst: beforeFirst
                    },
                    bubbles: true,
                    composed: true
                }));
                this.curHovering.style['border-top'] = '';
                this.curHovering.style['border-bottom'] = '';
                this.curHovering = null;
            }
            break;
        }
      }
}

window.customElements.define('map-layer', MapLayer);