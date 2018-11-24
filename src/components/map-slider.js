import {LitElement, html} from '@polymer/lit-element';
import {MDCSlider} from '@material/slider/index';

/**
* @polymer
* @extends HTMLElement
*/
class MapSlider extends LitElement {
  static get properties() { 
    return { 
      active: Boolean,
      value: Number
    }; 
  }
  constructor() {
      super();
      this.active = true;
      this.value = 100;
  }
  shouldUpdate(changedProps) {
      return this.active;
  }
  render() {
    return html`
      <style>
        @import "node_modules/@material/slider/dist/mdc.slider.css";
        .mdc-slider:not(.mdc-slider--disabled) .mdc-slider__track-container {
          background-color: var(--mdc-theme-primary, rgba(1, 135, 134, 0.26)); 
        }
      </style>
      <div class="mdc-slider" tabindex="0" @MDCSlider:input="${e=>this.change(e)}" @MDCSlider:change="${e=>this.change(e)}" role="slider"
            aria-valuemin="0" aria-valuemax="100" aria-valuenow="${this.value}"
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
  change(e) {
    const newValue = e.detail.value;
    if (Math.round(newValue) != Math.round(this.value)) {
      this.value = newValue;
      this.dispatchEvent(
        new CustomEvent('slidervaluechange', 
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
customElements.define('map-slider', MapSlider);
