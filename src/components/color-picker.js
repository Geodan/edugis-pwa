import {LitElement, html} from 'lit-element';

/**
* @polymer
* @extends HTMLElement
*/
class ColorPicker extends LitElement {
  static get properties() { 
    return {
        visible: {type: Boolean},
        layerid: {type: String},
        color: {type: String}, // input color
        value: {type: String} // output color
    }; 
  }
  static get style() {
    return css`
      #picker {
        display: inline-block;
        width: 10px;
        height: 5px;
        border: 1px solid green;
        }`
  }
  constructor() {
      super();
      this.visible = false;
      this.color = this.value = "";
  }
  render() {
    return html`<slot @click="${this.click}"></slot>${this.visible?html`<div id="picker"></div>`:''}`
  }
  click(e) {
    this.visible = !this.visible;
  }
  _valueChanged(color, source, instance) {
    this.value = color.toRGBA().toString();
    this.dispatchEvent(new CustomEvent("change", {
      detail: {
        color: this.value,
        layerid: this.layerid
      }
    }))
  }
  updated(changedProperties) {
    if (changedProperties.has("visible")) {
      if (this.pickr && !this.visible) {
        this.pickr.destroyAndRemove();
      }
      if (this.visible) {
        this.pickerElement = this.shadowRoot.querySelector('#picker');
        this.pickr = Pickr.create({
          default: this.color,
          el: this.pickerElement,
          theme: 'nano', // or 'monolith', or 'nano'
      
          useAsButton: false,
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
                  hex: true,
                  rgba: true,
                  hsla: true,
                  hsva: true,
                  cmyk: true,
                  input: true,
                  clear: true,
                  save: true
              }
            }
        });
        this.pickr.on('change', (color, source, instance) => this._valueChanged(color, source, instance));
      }
    }  
  }
  _show(event) {
      
  }
}
customElements.define('color-picker', ColorPicker);