//import {html, css, LitElement} from 'lit-element';
import {html, LitElement} from 'lit-element';
import {MDCSlider} from '@material/slider/index.js';
import {mdcslidercss} from '../../../lib/mdc.slider.css.js';

/**
* @polymer
* @extends HTMLElement
*/
class BaseSlider extends LitElement {
  static get properties() { 
    return { 
      active: {type: Boolean},
      value: {type: Number},
      minvalue: {type: Number},
      maxvalue: {type: Number},
      id: {type: String}
    }; 
  }
  constructor() {
      super();
      this.active = true;
      this.minvalue = 0;
      this.maxvalue = 100;
      this.value = 0;
      this.id= "none";
  }
  shouldUpdate(changedProps) {
      if (changedProps.has('value')) {
        if (this.slider) {
          this.slider.value = this.value;
        }
      }
      return this.active;
  }
  render() {
    return html`
      ${mdcslidercss}
      <style>
        .mdc-slider:not(.mdc-slider--disabled) .mdc-slider__track-container {
          background-color: var(--mdc-theme-primary, rgba(1, 135, 134, 0.26)); 
        }
      </style>
      <div class="mdc-slider" tabindex="0" @MDCSlider:input="${e=>this.change(e)}" @MDCSlider:change="${e=>this.change(e)}" role="slider"
            aria-valuemin="${this.minvalue}" aria-valuemax="${this.maxvalue}" aria-valuenow="${this.value}"
            aria-label="Select Value">
        <div class="mdc-slider__track-container">
          <div class="mdc-slider__track"></div>
        </div>
        <div class="mdc-slider__thumb-container">
          <svg class="mdc-slider__thumb" width="21" height="21">
            <circle cx="10.5" cy="10.5" r="7.875"></circle>
          </svg>
          <div class="mdc-slider__focus-ring"></div>
        </div>
      </div>`
  }
  firstUpdated() {
    this.slider = new MDCSlider(this.shadowRoot.querySelector('.mdc-slider'));
  }
  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  change(e) {
    const newValue = e.detail.value;
    if (Math.round(newValue) != Math.round(this.value)) {
      this.value = newValue;
      this.dispatchEvent(
        new CustomEvent('change', 
            {
                detail: {
                    value: Math.round(this.value)
                }
            }
        )
    );
    }
  }
}
customElements.define('base-slider', BaseSlider);
