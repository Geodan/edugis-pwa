/**
  element that can be dragged inside a vertical scrollable list of elements
*/

import { LitElement, html } from 'lit';
import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import * as Gestures from '@polymer/polymer/lib/utils/gestures.js';

class LitDragHandle extends GestureEventListeners(LitElement) {
  static get properties() {
    return {
      stylepos: String,
      itemcontainer: Object,
      itemscroller: Object,
      isdraggable: Boolean
    };
  }
  constructor() {
    super();
    Gestures.addListener(this, 'track', e=>this.handleTrack(e));
    this.clientRect = null;
    // initialize properties
    this.stylepos = "";
    this.itemcontainer = undefined;
    this.itemscroller = undefined;
    this.isdraggable = true;
  }
  scrollUp() {
    if (this.scrollingUp) {
      if (this.itemscroller.scrollTop > 1) {
        this.itemscroller.scrollTop--;
        this.startOffsetTop--;
        this.top--;
        this.stylepos=`top:${top}px;`;
        setTimeout(()=>this.scrollUp(), 100);
      } else {
        this.scrollingUp = false;
      }
    }
  }
  scrollDown() {
    if (this.scrollingDown) {
      if (this.itemscroller.scrollTop < this.itemScrollerHeight - this.itemScrollerClientRect.height - 1) {
        this.itemscroller.scrollTop++;
        this.startOffsetTop++;
        this.top++;
        this.stylepos=`top:${top}px;`;
        setTimeout(()=>this.scrollDown(), 50);
      } else {
        this.scrollingDown = false;
      }
    }
  }
  findSiblings(y, x){
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
  handleTrack(event) {
    if (!this.itemcontainer) {
      // container not defined
      return;
    }
    switch(event.detail.state) {
      case 'start':
        this.container = this.shadowRoot.querySelector('.container');
        this.curHovering = null;
        this.startOffsetTop = this.container.offsetTop;// always zero?
        if (this.itemscroller) {
          this.itemScrollerHeight = this.itemscroller.scrollHeight;
          this.itemScrollerClientRect = this.itemscroller.getBoundingClientRect();
        }
        break;
      case 'track':
        let top = this.startOffsetTop + event.detail.dy;
        if (this.itemscroller) {
          if (event.detail.y < this.itemScrollerClientRect.top) {
            // pointer above scroller
            this.scrollingUp = true;
            this.scrollUp();
          } else {
            // stop scrolling
            this.scrollingUp = false;
          }
          if (event.detail.y > this.itemScrollerClientRect.top + this.itemScrollerClientRect.height) {
            // pointer below scroller
            this.scrollingDown = true;
            this.scrollDown();
          } else {
            this.scrollingDown = false;
          }
          if (top > this.itemScrollerHeight - 1) {
            top = this.itemScrollerHeight - 1;
          }
        }
        this.top = top;
        this.stylepos=`top:${top}px;`;
        const hovering  = this.findSiblings(event.detail.y, event.detail.x);
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
        this.container = null;
        this.stylepos = "";
        if (this.curHovering) {
          let beforeFirst = false;
          if (this.curHovering.style['border-top'].length) {
            beforeFirst = true;
          }
          this.dispatchEvent(new CustomEvent('litdragend', 
            {
              detail: {dragTarget: this.curHovering, beforeFirst: beforeFirst },
              composed: true,
              bubbles: true
            }  
          ));
          this.curHovering.style['border-top'] = '';
          this.curHovering.style['border-bottom'] = '';
          this.curHovering = null;
        }
        break;
    }
  }
  render() {
    return html`
    <style>
      :host {
        position: relative;
        display: inline-block;
        height: 1em;
      }
      .container {
        position: absolute;
      }
      .draghandle {
        cursor: move;
      }
      slot {
        display: inline-block;
        width: 200px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
    </style>
    <div class="container${this.isdraggable?' draghandle':''}" style="${this.stylepos}">
      <slot>Default DragHandle Text Default DragHandle Text</slot>
    </div>
    `;
  }
}

window.customElements.define('lit-draghandle', LitDragHandle);
