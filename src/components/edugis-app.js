/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { LitElement, html } from '@polymer/lit-element';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings.js';

// These are the actions needed by this element.
import {
//  navigate,
//  updateOffline,
//  updateLayout
} from '../actions/app.js';

// These are the elements needed by this element.
import { menuIcon } from './my-icons.js';
import './web-map.js';
import './snack-bar.js';

function getHashParameters()
{
  const hash = location.hash.substr(1);
  return hash.split('&').reduce(function (result, item) {
    var parts = item.split('=');
    result[parts[0]] = parts[1];
    return result;
  }, {});
}

import datacatalog from '../datacatalog.js';
/**
* @polymer
* @extends HTMLElement
*/
class EduGISApp extends (LitElement) {
  static get properties() {
    return {
      appTitle: String,
      configUrl: String
    }
  }
  constructor() {
    super();
    this.configUrl = getHashParameters().configurl;
    // To force all event listeners for gestures to be passive.
    // See https://www.polymer-project.org/3.0/docs/devguide/settings#setting-passive-touch-gestures
    setPassiveTouchGestures(true);
  }
  render() {
    // Anything that's related to rendering should be done in here.
    return html`
    <style>
:host{
  display: block;
  width: 100%;
  height: 100%;
}
header {
  position: absolute;
  display: block;
  top: 0px;
  width: 100%;
  height: 40px;
  background-color: #2e7dba;
  color: white;
  box-sizing: border-box;
  padding-left: 1em;
}

.topnav {
  position: absolute;
  top: 0px;
  right: 1em;
  text-align: right;
  box-sizing: border-box;
}

.topnav ul { 
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.topnav ul li {
  display: inline-block;
  padding-left: 4px;
}

.topnav ul .menu-btn-container {
  display: none;
}

.topnav ul li a {
  display: block;
  text-decoration: none;
  color: white;
}

.menu-btn {
  background: none;
  border: none;
  fill: white;
  cursor: pointer;
  height: 24px;
  width: 24px;
  padding: 1px;
}

@media only screen and (max-width: 650px) {
  .topnav ul .menuitem {
    display: none;
  }
  .topnav ul .menu-btn-container {
    display: inline-block;
  }
}

web-map {
  position: absolute;
  top: 40px;
  display: block;
  width: 100%;
  bottom: 1.5em;
  box-sizing: border-box;
  background: lightslategray;
}

footer {
  position: absolute;
  display: block;
  bottom: 0px;
  width: 100%;
  height: 1.5em;
  background-color: #2e7dba;
  color: white;
  box-sizing: border-box;
  padding-left: 0.5em;
}

.App-search {
  position: absolute;
  top: 10px;
  right: 10px;
}

</style>
    <header>
      <img src="${document.baseURI}images/edugislogo.png" alt="logo"/>
        <nav class="topnav">
          <ul>
            <li class="menuitem"><a href="#">openen</a></li>
            <li class="menuitem"><a href="#">opslaan</a></li>
            <li class="menuitem"><a href="#">permalink</a></li>
            <li class="menuitem"><a href="#">help</a></li>
            <li class="menu-btn-container"><button class="menu-btn">${menuIcon}</button></li>
          </ul>
        </nav>
    </header>
    <web-map .configurl="${this.configUrl}" navigation="bottom-left" scalebar="bottom-right" geolocate="top-right" coordinates="true" .datacatalog="${datacatalog}" haslegend="true" .accesstoken="${EduGISkeys.mapbox}"></web-map>
    <footer className="App-footer">&copy;2018 EduGIS, Geodan</footer>
    `;
  }
  firstUpdated() {
    window.addEventListener("hashchange", ()=>this.hashChanged());
  }
  hashChanged() {    
    const result = getHashParameters();
    if (result.hasOwnProperty('configurl')) {
      this.configUrl = result.configurl;
    } else {
      this.configUrl = "";
    }
  }
}

window.customElements.define('edugis-app', EduGISApp);
