import {html, css, LitElement} from 'lit-element';

/**
* @polymer
* @extends HTMLElement
*/
class BaseSelect extends LitElement {
    static get properties() {
        return {
            slottedItems: {type: Array}
        }
    }
    static get styles() {
        return css`
            :host {
                display: inline-block;
            }
            .bscontainer {
                border: 1px solid #ccc;
                box-sizing: border-box;
                border-radius: 3px;
                overflow: hidden;
                position: relative;
                margin-bottom: -3px;
            }
            select:focus { 
                outline: none;
            }
            select:-moz-focusring {
                color: transparent;
                text-shadow: 0 0 0 #000;
            }
            .bscontainer select {
                height: 28px;
                padding: 5px 0 5px 5px;
                background: transparent;
                border: none;
                
                /*hide default down arrow in webkit */
                -webkit-appearance: none; 
            }
            .bscontainer .arrow {
                position: absolute;
                top: 0;
                width: 28px;
                right: 0px;
                height:100%;
                border-left: 1px solid #E0E0E0;
                pointer-events: none;
            }
            .bscontainer .arrow::after {
                position: absolute;
                  content: '';
                  left: 9px;
                  top: 6px;
                  border: solid black;
                  border-width: 0 1px 1px 0;
                  display: inline-block;
                  padding: 5px;
                  transform: rotate(45deg);
                  --webkit-transform: rotate(45deg);
            }
            @-moz-document url-prefix(){
                .bscontainer select { width: 110%; }
            }
            select::-ms-expand { 
                display: none;  /* hide default down arrow in IE10*/
            }
              
            /* hack to fall back in opera */
            _:-o-prefocus, .selector {
                .bscontainer { background: none; }
            }
            .hidden {
                display: none;
            }
        `
    }
    constructor() {
        super();
        this.slottedItems = [];
        this.value = null;
    }
    renderContainer() {

    }
    render() {
        return html`<div class="hidden" @slotchange="${(e)=>this._updateSlotted()}"><slot></slot></div>
            <div class="bscontainer">
                <select @change="${()=>this._selectChanged()}">
                    ${this.slottedItems.map(item=>html`<option value="${item.value?item.value:item.textContent}" ?selected="${item.selected}">${item.textContent}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</option>`)}
                </select>
                <span class="arrow"></span>
            </div>
        `
    }
    _updateSlotted() {
        this.slottedItems = this.shadowRoot.querySelector('slot').assignedNodes().filter(node=>node.tagName === 'OPTION');
        let index = this.slottedItems.findIndex(item=>item.selected);
        if (index > -1) {
            this.value = this.slottedItems[index].value?this.slottedItems[index].value:this.slottedItems[index].textContent;
        } else {
            this.value = "";
        }
    }
    firstUpdated() {
        //this._updateSlotted();
    }
    _selectChanged() {
        this.value = this.shadowRoot.querySelector('select').value;
        this.dispatchEvent(new CustomEvent('change', {
            bubbles: true,
            composed: true
        }))
    }
}

window.customElements.define('base-select', BaseSelect);