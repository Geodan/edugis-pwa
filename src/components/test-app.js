/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { LitElement, html } from 'lit';
import './test-item.js';

const itemList = ["Apples", "Oranges", "Bananas", "Strawberries"];

class TestApp extends LitElement {
  constructor() {
    super();
    this._el = null;
  }
  dragEnd(e) {
    this._el = null;
    e.target.classList.remove('dragging');
  }
  dragOver(e) {
    if (this.isBefore(this._el, e.target))
      e.target.parentNode.insertBefore(this._el, e.target);
    else
      e.target.parentNode.insertBefore(this._el, e.target.nextSibling);
  }
  dragStart(e) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", null);
    this._el = e.target;
    e.target.classList.add('dragging');
  }
  isBefore(el1, el2) {
    if (el2.parentNode === el1.parentNode)
    for (var cur = el1.previousSibling; cur; cur = cur.previousSibling)
        if (cur === el2)
            return true;
    return false;
  }
  _render({appTitle, _page, _drawerOpened, _snackbarOpened, _offline}) {
  return html`
  <style>
    .dragging {opacity: 0.25;color: orange;}

  </style>
    <ul>${itemList.map(item=>html`<test-item draggable="true" on-dragend="${e=>this.dragEnd(e)}" on-dragover="${e=>this.dragOver(e)}" on-dragstart="${e=>this.dragStart(e)}">${item}</test-item>`)}</ul>`;
  }

  _firstRendered() {
  }

  _didRender(properties, changeList) {
  }

}

window.customElements.define('test-app', TestApp);
