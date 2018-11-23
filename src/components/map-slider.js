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
  sliderStyle() {
    /* 
       created with CSS Style Generator for Range Inputs
       http://danielstern.ca/range.css
    */
    return html`
    <style>
      input[type=range] {
        -webkit-appearance: none;
        width: 100%;
        margin: 5px 0;
      }
      input[type=range]:focus {
        outline: none;
      }
      input[type=range]::-webkit-slider-runnable-track {
        width: 100%;
        height: 1px;
        cursor: pointer;
        box-shadow: 0px 0px 0.1px #000000, 0px 0px 0px #0d0d0d;
        background: #555555;
        border-radius: 0px;
        border: 0px solid #010101;
      }
      input[type=range]::-webkit-slider-thumb {
        box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
        border: 0px solid #000000;
        height: 11px;
        width: 11px;
        border-radius: 5px;
        background: #555555;
        cursor: pointer;
        -webkit-appearance: none;
        margin-top: -5px;
      }
      input[type=range]:focus::-webkit-slider-runnable-track {
        background: #626262;
      }
      input[type=range]::-moz-range-track {
        width: 100%;
        height: 1px;
        cursor: pointer;
        box-shadow: 0px 0px 0.1px #000000, 0px 0px 0px #0d0d0d;
        background: #555555;
        border-radius: 0px;
        border: 0px solid #010101;
      }
      input[type=range]::-moz-range-thumb {
        box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
        border: 0px solid #000000;
        height: 11px;
        width: 11px;
        border-radius: 5px;
        background: #555555;
        cursor: pointer;
      }
      input[type=range]::-ms-track {
        width: 100%;
        height: 1px;
        cursor: pointer;
        background: transparent;
        border-color: transparent;
        color: transparent;
      }
      input[type=range]::-ms-fill-lower {
        background: #484848;
        border: 0px solid #010101;
        border-radius: 0px;
        box-shadow: 0px 0px 0.1px #000000, 0px 0px 0px #0d0d0d;
      }
      input[type=range]::-ms-fill-upper {
        background: #555555;
        border: 0px solid #010101;
        border-radius: 0px;
        box-shadow: 0px 0px 0.1px #000000, 0px 0px 0px #0d0d0d;
      }
      input[type=range]::-ms-thumb {
        box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
        border: 0px solid #000000;
        height: 11px;
        width: 11px;
        border-radius: 5px;
        background: #555555;
        cursor: pointer;
        height: 1px;
      }
      input[type=range]:focus::-ms-fill-lower {
        background: #555555;
      }
      input[type=range]:focus::-ms-fill-upper {
        background: #626262;
      }
    </style>
    `
  }
  shouldUpdate(changedProps) {
      return this.active;
  }
  render2() {
    return html`
      ${this.sliderStyle()}
      <input type="range" @input="${e=>this.updateValue(e)}" .value="${this.value}">`;
  }
  render() {
    return html`
      <style>
        @import "node_modules/@material/slider/dist/mdc.slider.css";
      </style>
      <div class="mdc-slider" role="slider"
            aria-valuemin="0" aria-valuemax="50" aria-valuenow="20"
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
}
customElements.define('map-slider', MapSlider);
