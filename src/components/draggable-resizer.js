import { LitElement, html, css } from 'lit';
import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import * as Gestures from '@polymer/polymer/lib/utils/gestures.js';

class DraggableResizer extends GestureEventListeners(LitElement) {
    static get properties () {
        return {
          stylepos: {type: String}
        }
    }
    constructor() {
        super();
        Gestures.addListener(this, 'track', e=>this._handleTrack(e));
    }    
    static get styles() {
        return css `
            :host {
                display: inline-block;
                cursor: move;
            }
            #sizer {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              background-color: yellow;
            }
        `
    }
    render() {
        return html`
            <div id="sizer"></div>
        `
    }
    _handleTrack(event) {
      let newPos;
      switch(event.detail.state) {
        case 'start':
          console.log('start');
          this.container = this.shadowRoot.querySelector('#sizer');
          this.curHovering = null;
          this.startOffsetLeft = this.container.offsetLeft;
          break;
        case 'track':
          console.log('track');
          let left = this.startOffsetLeft + event.detail.dx;
          this.container.style.left = left + 'px';
          this.stylepos = left;
          newPos = this.container.getClientRects()[0].left;
          if (newPos < 50) {
            newPos = 50;
          }
          this.dispatchEvent(new CustomEvent('track', {detail: {type: 'track', pos: newPos}}));
          break;
        case 'end':
          console.log('end');
          newPos = this.container.getClientRects()[0].left;
          if (newPos < 50) {
            newPos = 50;
          }
          this.dispatchEvent(new CustomEvent('track', {detail: {type: 'end', pos: newPos}}));
          this.style.left = newPos + 'px';
          this.container.style.left = 0;
          this.stylepos = "";
          break;
      }
    }
}

customElements.define('draggable-resizer', DraggableResizer);