/**
  element that can be dragged inside a scrollable list of elements
*/

import { LitElement, html } from '@polymer/lit-element';
import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import * as Gestures from '@polymer/polymer/lib/utils/gestures.js';

class LitDragHandle extends GestureEventListeners(LitElement) {
  static get properties() {
    return {
      stylepos: String,
      itemcontainer: Object
    };
  }
  constructor() {
    super();
    Gestures.addListener(this, 'track', e=>this.handleTrack(e));
    this.clientRect = null;
    // initialize properties
    this.stylepos = "";
    this.itemcontainer = undefined;
  }
  scrollUp() {
    if (this.scrollingUp) {
      if (this.itemcontainer.scrollTop > 1 && this.startOffsetTop > 1 && this.top > 1) {
        this.itemcontainer.scrollTop--;
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
      if (this.itemcontainer.scrollTop < this.parentScrollHeight - this.parentClientRect.height - 1) {
        this.itemcontainer.scrollTop++;
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
    const siblings = [...this.itemcontainer.children];
    //console.log(`x: ${x}, this.parentClientRect.offsetLeft: ${this.parentClientRect.offsetLeft}`)
    if (!this.parentClientRect || 
        x > this.parentClientRect.left + this.parentClientRect.width + 20 ||
        x < this.parentClientRect.left - 20) {
      return [];
    }
    return siblings.filter(elem=> {
        const elemClientRect = elem.getBoundingClientRect();
        return (y > elemClientRect.y && y < (elemClientRect.y + elemClientRect.height));
      });
  }
  handleTrack(event) {
    if (!this.itemcontainer) {
      // container not defined
      return;
    }
    switch(event.detail.state) {
      case 'start':
        this.container = this.shadowRoot.querySelector('.container');
        this.startOffsetTop = this.container.offsetTop;
        this.parentScrollHeight = this.itemcontainer.scrollHeight;
        this.parentClientRect = this.itemcontainer.getBoundingClientRect();
        this.curHovering = null;
        break;
      case 'track':
        let top = this.startOffsetTop + event.detail.dy;
        if (this.top < 0) {
          top = 0;
        }
        if (event.detail.y < this.parentClientRect.top) {
          // pointer above scroller
          this.scrollingUp = true;
          this.scrollUp();
        } else {
          // stop scrolling
          this.scrollingUp = false;
        }
        if (event.detail.y > this.parentClientRect.top + this.parentClientRect.height) {
          // pointer below scroller
          this.scrollingDown = true;
          this.scrollDown();
        } else {
          this.scrollingDown = false;
        }
        if (top > this.parentScrollHeight - 1) {
          top = this.parentScrollHeight - 1;
        }
        this.top = top;
        this.stylepos=`top:${top}px;`;
        const hovering  = this.findSiblings(event.detail.y, event.detail.x);
        if (hovering.length && hovering[0] !== this) {
          if (hovering[0] !== this.curHovering) {
            if (this.curHovering) {
              this.curHovering.style['border-bottom'] = '';
            }
            hovering[0].style['border-bottom'] = 'solid 4px black';
            this.curHovering = hovering[0];
          }
        } else {
          if (this.curHovering) {
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
          this.curHovering.style['border-bottom'] = '';
          dispatchEvent(new CustomEvent('customdrop', 
            {
              detail: {element: this.curHovering},
            }  
          ));
          this.curHovering = null;
        }
        break;
    }
  }
  _render({stylepos, allowdrop}) {
    
    return html`
    <style>
      :host {
        position: relative;
        display: inline-block;
        height: 1em;
      }
      .container {
        position: absolute;
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
        cursor: move;
      }
    </style>
    <div class="container" style$="${stylepos}">
      <slot>Default DragHandle Text</slot>
    </div>
    `;
  }
}

window.customElements.define('lit-draghandle', LitDragHandle);
