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
    return [css`
      :host {
        display: block;
      }
      `,
      css`input[type=range] {
        height: 17px;
        -webkit-appearance: none;
        margin: 10px 0;
        width: 100%;
        background-color: rgba(0,0,0,0);
      }
      input[type=range]:focus {
        outline: none;
      }
      input[type=range]::-webkit-slider-runnable-track {
        width: 100%;
        height: 2px;
        cursor: pointer;
        animate: 0.2s;
        box-shadow: 0px 0px 0px #000000;
        background: #CCCCCC;
        border-radius: 5px;
        border: 0px solid #000000;
      }
      input[type=range]::-webkit-slider-thumb {
        box-shadow: 0px 0px 0px #000000;
        border: 0px solid #2497E3;
        height: 11px;
        width: 11px;
        border-radius: 10px;
        background: #555;
        cursor: pointer;
        -webkit-appearance: none;
        margin-top: -4.5px;
      }
      input[type=range]:focus::-webkit-slider-runnable-track {
        background: #CCCCCC;
      }
      input[type=range]::-moz-range-track {
        width: 100%;
        height: 2px;
        cursor: pointer;
        animate: 0.2s;
        box-shadow: 0px 0px 0px #000000;
        background: #CCCCCC;
        border-radius: 5px;
        border: 0px solid #000000;
      }
      input[type=range]::-moz-range-thumb {
        box-shadow: 0px 0px 0px #000000;
        border: 0px solid #2497E3;
        height: 11px;
        width: 11px;
        border-radius: 10px;
        background: #555;
        cursor: pointer;
      }
      input[type=range]::-ms-track {
        width: 100%;
        height: 2px;
        cursor: pointer;
        animate: 0.2s;
        background: transparent;
        border-color: transparent;
        color: transparent;
      }
      input[type=range]::-ms-fill-lower {
        background: #CCCCCC;
        border: 0px solid #000000;
        border-radius: 10px;
        box-shadow: 0px 0px 0px #000000;
      }
      input[type=range]::-ms-fill-upper {
        background: #CCCCCC;
        border: 0px solid #000000;
        border-radius: 10px;
        box-shadow: 0px 0px 0px #000000;
      }
      input[type=range]::-ms-thumb {
        margin-top: 1px;
        box-shadow: 0px 0px 0px #000000;
        border: 0px solid #2497E3;
        height: 11px;
        width: 11px;
        border-radius: 10px;
        background: #555;
        cursor: pointer;
      }
      input[type=range]:focus::-ms-fill-lower {
        background: #CCCCCC;
      }
      input[type=range]:focus::-ms-fill-upper {
        background: #CCCCCC;
      }
      `]
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