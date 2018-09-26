import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import * as Gestures from '@polymer/polymer/lib/utils/gestures.js';

import {LitElement, html} from '@polymer/lit-element';
import {closeIcon} from './my-icons';
import './map-iconbutton';
/**
* @polymer
* @extends HTMLElement
*/
class MapDialog extends GestureEventListeners(LitElement) {
  static get properties() { 
    return { 
      stylepos: String,
      dialogtitle: String
    }; 
  }
  constructor() {
      super();
      Gestures.addListener(this, 'track', e=>this.handleTrack(e));
  }
  close() {
    this.dispatchEvent(new CustomEvent('close'));
  }
  _render({dialogtitle}) {
    return html`<style>
        .container {
          position: absolute;
          left: calc(50% - 100px);
          top: calc(50% - 100px);
          min-width: 200px;
          min-height: 200px;
          background-color: white;
          border-radius: 4px;
          box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
          cursor: move;
          user-select: none;
        }
        .titlebar {
          width: 100%;
          background-color: white; /*lightskyblue;*/
          height: 34px;
          line-height: 34px;
          padding-left: 4px;
          padding-right: 2px;
          border-bottom: 1px solid lightblue;
          font-weight: bold;
          box-sizing: border-box;
          border-radius: 4px 4px 0 0;
        }
        .right {
          float: right;
          margin-top: 2px;
        }
        map-iconbutton {
          width: 30px;
          height: 30px;
        }
    </style>
    <div class="container" style$="${this.stylepos}">
      <div class="titlebar">${dialogtitle}<span class="right"><map-iconbutton info="close" icon="${closeIcon}" on-click="${(e)=>this.close()}"></map-iconbutton</span></div>
      <slot>Dummy content</slot>
    </div>`;
  }
  handleTrack(event) {
    switch(event.detail.state) {
      case 'start':
        this.container = this.shadowRoot.querySelector('.container');
        this.startOffsetTop = this.container.offsetTop;
        this.startOffsetLeft = this.container.offsetLeft;
        break;
      case 'track':
        let top = this.startOffsetTop + event.detail.dy;
        let left = this.startOffsetLeft + event.detail.dx;
        this.stylepos=`top:${top}px;left:${left}px;`;
        break;
      case 'end':
        ;
        break;
    }
  }
}
customElements.define('map-dialog', MapDialog);
