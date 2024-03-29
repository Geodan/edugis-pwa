import {html} from 'lit';

export const mdcslidercss = html`
<style>
/*!
 Material Components for the Web
 Copyright (c) 2018 Google Inc.
 License: MIT
*/
@-webkit-keyframes mdc-slider-emphasize {
  0% {
    -webkit-animation-timing-function: ease-out;
            animation-timing-function: ease-out; }
  50% {
    -webkit-animation-timing-function: ease-in;
            animation-timing-function: ease-in;
    -webkit-transform: scale(0.85);
            transform: scale(0.85); }
  100% {
    -webkit-transform: scale(0.571);
            transform: scale(0.571); } }

@keyframes mdc-slider-emphasize {
  0% {
    -webkit-animation-timing-function: ease-out;
            animation-timing-function: ease-out; }
  50% {
    -webkit-animation-timing-function: ease-in;
            animation-timing-function: ease-in;
    -webkit-transform: scale(0.85);
            transform: scale(0.85); }
  100% {
    -webkit-transform: scale(0.571);
            transform: scale(0.571); } }

.mdc-slider {
  position: relative;
  width: 100%;
  height: 48px;
  cursor: pointer;
  touch-action: pan-x;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0); }
  .mdc-slider:not(.mdc-slider--disabled) .mdc-slider__track {
    background-color: #018786;
    /* @alternate */
    background-color: var(--mdc-theme-secondary, #018786); }
  .mdc-slider:not(.mdc-slider--disabled) .mdc-slider__track-container {
    background-color: rgba(1, 135, 134, 0.26); }
  .mdc-slider:not(.mdc-slider--disabled) .mdc-slider__track-marker::after,
  .mdc-slider:not(.mdc-slider--disabled) .mdc-slider__track-marker-container::after {
    background-color: #018786;
    /* @alternate */
    background-color: var(--mdc-theme-secondary, #018786); }
  .mdc-slider:not(.mdc-slider--disabled) .mdc-slider__thumb {
    fill: #018786;
    /* @alternate */
    fill: var(--mdc-theme-secondary, #018786);
    stroke: #018786;
    /* @alternate */
    stroke: var(--mdc-theme-secondary, #018786); }
  .mdc-slider:not(.mdc-slider--disabled) .mdc-slider__focus-ring {
    background-color: #018786;
    /* @alternate */
    background-color: var(--mdc-theme-secondary, #018786); }
  .mdc-slider:not(.mdc-slider--disabled) .mdc-slider__pin {
    background-color: #018786;
    /* @alternate */
    background-color: var(--mdc-theme-secondary, #018786); }
  .mdc-slider:not(.mdc-slider--disabled) .mdc-slider__pin {
    color: white;
    /* @alternate */
    color: var(--mdc-theme-text-primary-on-dark, white); }
  .mdc-slider--disabled {
    cursor: auto; }
    .mdc-slider--disabled .mdc-slider__track {
      background-color: #9a9a9a; }
    .mdc-slider--disabled .mdc-slider__track-container {
      background-color: rgba(154, 154, 154, 0.26); }
    .mdc-slider--disabled .mdc-slider__track-marker::after,
    .mdc-slider--disabled .mdc-slider__track-marker-container::after {
      background-color: #9a9a9a; }
    .mdc-slider--disabled .mdc-slider__thumb {
      fill: #9a9a9a;
      stroke: #9a9a9a; }
    .mdc-slider--disabled .mdc-slider__thumb {
      /* @alternate */
      stroke: white;
      stroke: var(--mdc-slider-bg-color-behind-component, white); }
  .mdc-slider:focus {
    outline: none; }
  .mdc-slider__track-container {
    position: absolute;
    top: 50%;
    width: 100%;
    height: 2px;
    overflow: hidden; }
  .mdc-slider__track {
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-transform-origin: left top;
            transform-origin: left top;
    will-change: transform; }
    .mdc-slider[dir="rtl"] .mdc-slider__track,
    [dir="rtl"] .mdc-slider .mdc-slider__track {
      -webkit-transform-origin: right top;
              transform-origin: right top; }
  .mdc-slider__track-marker-container {
    display: flex;
    margin-right: 0;
    margin-left: -1px;
    visibility: hidden; }
    .mdc-slider[dir="rtl"] .mdc-slider__track-marker-container,
    [dir="rtl"] .mdc-slider .mdc-slider__track-marker-container {
      margin-right: -1px;
      margin-left: 0; }
    .mdc-slider__track-marker-container::after {
      display: block;
      width: 2px;
      height: 2px;
      content: ""; }
  .mdc-slider__track-marker {
    flex: 1; }
    .mdc-slider__track-marker::after {
      display: block;
      width: 2px;
      height: 2px;
      content: ""; }
    .mdc-slider__track-marker:first-child::after {
      width: 3px; }
  .mdc-slider__thumb-container {
    position: absolute;
    top: 15px;
    left: 0;
    width: 21px;
    height: 100%;
    -webkit-user-select: none;
       -moz-user-select: none;
        -ms-user-select: none;
            user-select: none;
    will-change: transform; }
  .mdc-slider__thumb {
    position: absolute;
    top: 0;
    left: 0;
    -webkit-transform: scale(0.571);
            transform: scale(0.571);
    transition: fill 100ms ease-out, stroke 100ms ease-out, -webkit-transform 100ms ease-out;
    transition: transform 100ms ease-out, fill 100ms ease-out, stroke 100ms ease-out;
    transition: transform 100ms ease-out, fill 100ms ease-out, stroke 100ms ease-out, -webkit-transform 100ms ease-out;
    stroke-width: 3.5; }
  .mdc-slider__focus-ring {
    width: 21px;
    height: 21px;
    transition: opacity 266.67ms ease-out, background-color 266.67ms ease-out, -webkit-transform 266.67ms ease-out;
    transition: transform 266.67ms ease-out, opacity 266.67ms ease-out, background-color 266.67ms ease-out;
    transition: transform 266.67ms ease-out, opacity 266.67ms ease-out, background-color 266.67ms ease-out, -webkit-transform 266.67ms ease-out;
    border-radius: 50%;
    opacity: 0; }
  .mdc-slider__pin {
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    margin-top: -2px;
    margin-left: -2px;
    -webkit-transform: rotate(-45deg) scale(0) translate(0, 0);
            transform: rotate(-45deg) scale(0) translate(0, 0);
    transition: -webkit-transform 100ms ease-out;
    transition: transform 100ms ease-out;
    transition: transform 100ms ease-out, -webkit-transform 100ms ease-out;
    border-radius: 50% 50% 50% 0%;
    z-index: 1; }
  .mdc-slider__pin-value-marker {
    font-family: Roboto, sans-serif;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 400;
    letter-spacing: 0.01786em;
    text-decoration: inherit;
    text-transform: inherit;
    -webkit-transform: rotate(45deg);
            transform: rotate(45deg); }

.mdc-slider--active .mdc-slider__thumb {
  -webkit-transform: scale3d(1, 1, 1);
          transform: scale3d(1, 1, 1); }

.mdc-slider--focus .mdc-slider__thumb {
  -webkit-animation: mdc-slider-emphasize 266.67ms linear;
          animation: mdc-slider-emphasize 266.67ms linear; }

.mdc-slider--focus .mdc-slider__focus-ring {
  -webkit-transform: scale3d(1.55, 1.55, 1.55);
          transform: scale3d(1.55, 1.55, 1.55);
  opacity: .25; }

.mdc-slider--in-transit .mdc-slider__thumb {
  transition-delay: 140ms; }

.mdc-slider--in-transit .mdc-slider__thumb-container,
.mdc-slider--in-transit .mdc-slider__track,
.mdc-slider:focus:not(.mdc-slider--active) .mdc-slider__thumb-container,
.mdc-slider:focus:not(.mdc-slider--active) .mdc-slider__track {
  transition: -webkit-transform 80ms ease;
  transition: transform 80ms ease;
  transition: transform 80ms ease, -webkit-transform 80ms ease; }

.mdc-slider--discrete.mdc-slider--active .mdc-slider__thumb {
  -webkit-transform: scale(calc(12 / 21));
          transform: scale(calc(12 / 21)); }

.mdc-slider--discrete.mdc-slider--active .mdc-slider__pin {
  -webkit-transform: rotate(-45deg) scale(1) translate(19px, -20px);
          transform: rotate(-45deg) scale(1) translate(19px, -20px); }

.mdc-slider--discrete.mdc-slider--focus .mdc-slider__thumb {
  -webkit-animation: none;
          animation: none; }

.mdc-slider--discrete.mdc-slider--display-markers .mdc-slider__track-marker-container {
  visibility: visible; }

/*# sourceMappingURL=mdc.slider.css.map*/
</style>
`