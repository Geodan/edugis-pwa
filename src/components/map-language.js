import {languageIcon} from './my-icons';

/* LanguageButton shows a button on the map. If pressed the button expands to show a list of languages.
   When selected, a "languagechanged" event with the new language is dispatched.
*/
import {LitElement, html} from '@polymer/lit-element';

/**
* @polymer
* @extends HTMLElement
*/
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
  render() {
    if (this.chooservisible) {
      return html`
      <div>
        <style>
          #langbutton {width: 100px; cursor: pointer} 
          div svg {display: inline-block; vertical-align: middle;}
          select {width:100%;
                border: 1px solid #d8e0e7;
                border-radius: 2px;
                background: #fff;
                color: #6b7c93;
                padding: 9.6px;
                font-size: 14px;
                height: 39.2px;
          }
        </style>
        <select @change="${e=>this.changeLangue(e)}">
          <option .selected="${this.language==="autodetect"?'selected':undefined}" value="autodetect">Browser</option>
          <option .selected="${this.language==="native"?'selected':undefined}" value="native">Local</option>
          <option .selected="${this.language==="en"?'selected':undefined}" value="en">English</option>
          <option .selected="${this.language==="de"?'selected':undefined}" value="de">Deutsch</option>
          <option .selected="${this.language==="fr"?'selected':undefined}" value="fr">Français</option>
          <option .selected="${this.language==="nl"?'selected':undefined}" value="nl">Nederlands</option>
          <option .selected="${this.language==="zh"?'selected':undefined}" value="zh">橘子</option>
          <option .selected="${this.language==="ru"?'selected':undefined}" value="ru">русский</option>
          <option .selected="${this.language==="ar"?'selected':undefined}" value="ar">العربية</option>
        </select>
      <div id="langbutton" title="Taal" @click="${e=>this.chooservisible=false}"><a>${languageIcon}<span>Kies taal</span></a></div>
      </div>`
    } else {
      return html`
        <style>
          button.mapboxgl-ctrl.mapboxgl-ctrl-group.mapboxgl-ctrl-language {
            width: 30px;
            height: 30px;
            display: block;
            padding: 0;
            outline: none;
            border: 0;
            box-sizing: border-box;
            background-color: transparent;
            cursor: pointer;
            margin-right: 0;
            margin-top: 0;
          }
          button:hover {
            background-color: whitesmoke;
          }
        </style>
        <button class="mapboxgl-ctrl mapboxgl-ctrl-group mapboxgl-ctrl-language" @click="${e=>this.toggleLanguageChooser(e)}">${languageIcon}</button>`;
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

/* LanguageControl according to mapbox-gl control API.
   LanguageControl inserts an <language-button></language-button> element
   to the map 
*/
class LanguageControl {
  constructor(litElement, defaultLanguage) {
    this._litElement = litElement;
    this._defaultLanguage = defaultLanguage;
  }
  onAdd(map) {
    this.pitch = 0;
    this._map = map;
    this._container = document.createElement('span');
    this._container.innerHTML = `<language-button .language="${this._defaultLanguage}"></language-button>`;
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


/* element to be inserted at <web-map></web-map> 
   this element initalizes and adds LanguageControl to the map
*/
/**
* @polymer
* @extends HTMLElement
*/
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
  shouldUpdate(changedProps) {
    const prevWebMap = changedProps.get('webmap')
    if (prevWebMap) {
      this.removeControl(prevWebmap);      
    }
    if (this.webmap) {
      if (this.active) {
        this.addControl(this.webmap);
      } else {
        this.removeControl(this.webmap);
      }
    }
    return this.webmap !== null;
  }
  render() {
    return html``;
  }
}
customElements.define('map-language', MapLanguage);
