import {LitElement, html, css} from 'lit';
import {translate as t} from '../i18n.js';

let colorPalette = [
  'rgba(128,128,128,0)',
  'rgba(255,255,255,1)',
  'rgba(0,0,0,1)',
  'rgba(103,58,183,1)',
  'rgba(213,62,79,1)',
  'rgba(255,255,191,1)',
  'rgba(33,139,69,1)',
  'rgba(255,193,7,1)',
  'rgba(158,202,225,1)'
];

/**
* @polymer
* @extends HTMLElement
*/
class ColorPicker extends LitElement {
  static get properties() { 
    return {
        color: {type: String}, // input color
    }; 
  }
  static get styles() {
    return css`
      :host {
        display: block;
      }`
  }
  constructor() {
      super();
      this.color = "";
  }
  render() {
    return html`<slot @slotchange="${e=>this._slotChanged(e)}"></slot>`
  }
  disconnectedCallback() {
    super.disconnectedCallback()
    if (this.pickr) {
      this.pickr.destroyAndRemove();
    }
  }
  _slotChanged(event) {
    const slot = this.shadowRoot.querySelector('slot');
    const element = slot.assignedElements().length?slot.assignedElements()[0]:null;
    if (element) {
      this._attachPickerToElement(element);
    }
  }
  _colorChanged(color) {
    this.color = color.toRGBA().toString(3).replace(/ /g,'');
    this.dispatchEvent(new CustomEvent("change", {
      detail: {
        color: this.color
      }
    }))
  }
  _updatePalette() {
    if (!colorPalette.find(colorItem=>colorItem === this.color)) {
      colorPalette.splice(9, 0, this.color);
      for (let i = 14; i >= 9; i--) {
        this.pickr.removeSwatch(i);
      }
      for (let i = 9; i < 14 && i < colorPalette.length; i++) {
        this.pickr.addSwatch(colorPalette[i]);
      }
    }
  }
  _attachPickerToElement(element) {
    if (element) {
      if (this.pickr) {
        this.pickr.destroyAndRemove();
      }
      this.pickr = Pickr.create({
        default: this.color,
        el: element,
        theme: 'nano', // or 'monolith', or 'nano'
        comparison:false,
        useAsButton: true,
        swatches: colorPalette.map(color=>color),
        components: {
            // Main components
            preview: true,
            opacity: true,
            hue: true,
    
            // Input / output Options
            interaction: {
                input: true,
                cancel: true,
                save: true,
                rgba: false,
                hsla: false,
                hsva: false,
                cmyk: false,
                hex: false
            }
        },
        i18n: {
          'btn:save': t('OK'),
          'btn:cancel':t('Cancel')
        }
      });
      this.pickr.on('change', (color, source, instance) => this._colorChanged(color, source, instance));
      this.pickr.on('cancel', () => {
        this._colorChanged(this.pickr.getColor());
        this.pickr.hide()
      });
      this.pickr.on('save', (c) => {
        this.pickr.hide();
        this._updatePalette();
      });
    }
  }
}
customElements.define('color-picker', ColorPicker);