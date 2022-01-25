import {LitElement, html, css} from 'lit-element';

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
    return html`<slot @slotchange=${e=>this._slotChanged(e)}></slot>`
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
    this.color = color.toRGBA().toString();
    this.dispatchEvent(new CustomEvent("change", {
      detail: {
        color: this.color
      }
    }))
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
        swatches: [
            'rgba(244, 67, 54, 1)',
            'rgba(233, 30, 99, 0.95)',
            'rgba(156, 39, 176, 0.9)',
            'rgba(103, 58, 183, 0.85)',
            'rgba(63, 81, 181, 0.8)',
            'rgba(33, 150, 243, 0.75)',
            'rgba(3, 169, 244, 0.7)',
            'rgba(0, 188, 212, 0.7)',
            'rgba(0, 150, 136, 0.75)',
            'rgba(76, 175, 80, 0.8)',
            'rgba(139, 195, 74, 0.85)',
            'rgba(205, 220, 57, 0.9)',
            'rgba(255, 235, 59, 0.95)',
            'rgba(255, 193, 7, 1)'
        ],
        components: {
            // Main components
            preview: true,
            opacity: true,
            hue: true,
    
            // Input / output Options
            interaction: {
                input: true,
                cancel: true,
                save: true
            }
        },
        i18n: {
          'btn:save': 'Ok',
          'btn:cancel':'Annuleer'
        }

      });
      this.pickr.on('change', (color, source, instance) => this._colorChanged(color, source, instance));
      this.pickr.on('cancel', () => {
        this._colorChanged(this.pickr.getColor());
        this.pickr.hide()
      });
      this.pickr.on('save', (color) => this.pickr.hide());
    }
  }
}
customElements.define('color-picker', ColorPicker);