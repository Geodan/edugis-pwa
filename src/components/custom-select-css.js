import {css} from 'lit';

export function customSelectCss() {
    /* based on: https://codepen.io/jamesbarnett/pen/JhHjK
       to be applied to:
       <div class="styled-select"><select><option>..</option></select><span class="arrow"></span></div>
    */
    return css`
    .styled-select {
        border: 1px solid #ccc;
        box-sizing: border-box;
        border-radius: 3px;        
        overflow: hidden;
        position: relative;
      }
      .styled-select, .styled-select select { width: 240px;}
      select:focus { outline: none; }
      .styled-select select {
        height: 34px;
        padding: 5px 0 5px 5px;
        background: transparent;
        border: none;
        
        /*hide default down arrow in webkit */
        -webkit-appearance: none; 
      }
      .styled-select .arrow {
        position: absolute;
        top: 0;
        width: 34px;
        right: 0px;
        height:100%;
        border-left: 1px solid #E0E0E0;
        pointer-events: none;
      }
      .styled-select .arrow::after {
        position: absolute;
          content: '';
          left: 12px;
          top: 9px;
          border: solid black;
          border-width: 0 1px 1px 0;
          display: inline-block;
          padding: 5px;
          transform: rotate(45deg);
          --webkit-transform: rotate(45deg);
      }
      
      @-moz-document url-prefix(){
        .styled-select select { width: 110%; }
      }
      select::-ms-expand { display: none; } /* hide default down arrow in IE10*/
      
      /* hack to fall back in opera */
      _:-o-prefocus, .selector {
        .styled-select { background: none; }
        }
    `
}
