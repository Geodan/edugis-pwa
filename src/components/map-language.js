import {languageIcon} from './my-icons';

import {LitElement, html} from '@polymer/lit-element';
class LanguageButton extends LitElement {
  static get properties() {
    return { 
      language: String,
      chooservisible: Boolean,
      webmap: Object
    }
  }
  constructor() {
    super();
    this.chooservisible = false;
  }
  _render({language, chooservisible}) {
    if (chooservisible) {
      return html`
      <div>
        <style>
          #langbutton {width: 100px; cursor: pointer} 
          div svg {display: inline-block; vertical-align: middle;}
          select {width:100%}
        </style>
        <select on-change="${e=>this.changeLangue(e)}">
          <option selected$="${language==="autodetect"?'selected':undefined}" value="autodetect">Browser</option>
          <option selected$="${language==="native"?'selected':undefined}" value="native">Local</option>
          <option selected$="${language==="en"?'selected':undefined}" value="en">English</option>
          <option selected$="${language==="de"?'selected':undefined}" value="de">Deutsch</option>
          <option selected$="${language==="fr"?'selected':undefined}" value="fr">Français</option>
          <option selected$="${language==="nl"?'selected':undefined}" value="nl">Nederlands</option>
          <option selected$="${language==="zh"?'selected':undefined}" value="zh">橘子</option>
          <option selected$="${language==="ru"?'selected':undefined}" value="ru">русский</option>
          <option selected$="${language==="ar"?'selected':undefined}" value="ar">العربية</option>
        </select>
      <div id="langbutton" title="Taal" on-click="${e=>this.chooservisible=false}"><a>${languageIcon}<span>Kies taal</span></a></div>
      </div>`
    } else {
      return html`
        <style>
          button {
            width: 30px;
            height: 30px;
            display: block;
            padding: 0;
            outline: none;
            border: 0;
            box-sizing: border-box;
            background-color: transparent;
            cursor: pointer;
          }
          button:hover {
            background-color: whitesmoke;
          }
        </style>
        <button class="mapboxgl-ctrl mapboxgl-ctrl-group mapboxgl-ctrl-language" on-click="${e=>this.toggleLanguageChooser(e)}">${languageIcon}</button>`;
    } 
  }
  toggleLanguageChooser(e) {
    this.chooservisible = !this.chooservisible;
  }
  changeLangue(e) {
    this.language = this.shadowRoot.querySelector('select').value;
    this.chooservisible = false;
    this.dispatchEvent(new CustomEvent("languagechanged",
      {
        detail: {language: this.language},
        bubbles: true,
        composed: true
      }
    ))
  }
}
customElements.define('language-button', LanguageButton);

class LanguageControl {
  constructor(litElement, defaultLanguage) {
    this._litElement = litElement;
    this._defaultLanguage = defaultLanguage;
  }
  onAdd(map) {
    this.pitch = 0;
    this._map = map;
    this._container = document.createElement('div');
    this._container.innerHTML = `<language-button language="${this._defaultLanguage}"></language-button>`;
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group mapboxgl-ctrl-language';
    
    //this.addEventListeners();
    
    return this._container;
  }
  
  addEventListeners (){
    //this._container.addEventListener('click', this._litElement.toggleLanguageChooser.bind(this._litElement));
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

import './map-iconbutton';


class MapLanguage extends LitElement {
  static get properties() { 
    return { 
      webmap: Object,
      active: Boolean,
      language: String,
      chooservisible: Boolean
    }; 
  }
  constructor() {
    super();
    // initialize members
    this.control = null;
    this.buttonrect = null;
    // initialize properties
    this.webmap = null;
    this.active = false;
    this.language = 'autodetect';
    this.chooservisible = false;
  }
  removeControl(webmap) {
    if (webmap && this.control) {
      webmap.removeControl(this.control);
      this.control = null;
    }
  }
  addControl(webmap) {
    if (webmap && !this.control) {
      this.control = new LanguageControl(this);
      webmap.addControl(this.control);
    }
  }
  _shouldRender(props, changedProps, prevProps) {
    if (changedProps && changedProps.webmap && prevProps && prevProps.webmap) {
      this.removeControl(prevProps.webmap);      
    }
    if (changedProps.hasOwnProperty('webmap') || changedProps.hasOwnProperty('active')) {
      if (props.webmap && props.active) {
        this.addControl(props.webmap);
      } else {
        this.removeControl(props.webmap);
      }
    }
    return props.webmap !== null;
  }
  _render({webmap, active, chooservisible, language}) {

    /* if (this.control) {
      if (chooservisible) {
        this.control._container.innerHTML = `<div><style>#langbutton {width: 100px;} div svg {display: inline-block; vertical-align: middle;}select {width:100%}</style><select>
        <option ${language==="autodetect"?'selected':''} value="autodetect">Browser</option>
        <option ${language==="native"?'selected':''} value="native">International</option>
        <option ${language==="en"?'selected':''} value="en">English</option>
        <option ${language==="de"?'selected':''} value="de">Deutsch</option>
        <option ${language==="fr"?'selected':''} value="fr">Français</option>
        <option ${language==="cn"?'selected':''} value="cn">橘子</option>
        <option ${language==="ru"?'selected':''} value="ru">русский</option>
        <option ${language==="ar"?'selected':''} value="ar">العربية</option>
      </select></div><div id="langbutton" title="Taal"><a>${languageIcon.getHTML()}<span>Kies taal</span></a></div>`
      } else {
        this.control._container.innerHTML = `<button id="langbutton" title="Taal">${languageIcon.getHTML()}</button>`
      }
    }*/
    return html``;
/*

    return html`${chooservisible?html`
      <style>
        .chooser {
          position: absolute;
          right: 40px;
          background: white;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }
      </style>
      <div class="chooser" style$="right:${this.buttonrect.left - 10}px;top:${this.buttonrect.top}px"><select>
        <option>autodetect</option>
        <option>native</option>
        <option>english</option>
        <option>deutsch</option>
      </select></div>`
      :''}`;
    */
  }
}
customElements.define('map-language', MapLanguage);
