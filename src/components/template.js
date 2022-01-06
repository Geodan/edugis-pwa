import {LitElement, html, css} from 'lit-element';
class TemplateComponent extends LitElement {
    static get styles() {
        return css`
        :host {
            display: block;
        }`
    }
    static get properties() { 
        return { 
          sprop: {type: String},
          numprop: {type: Number},
          objProp: {type: Object},
          arrProp: {type: Array},
          boolProp: {type: Boolean}
        }; 
    }
    constructor() {
        super();
        this.sprop = "";
        this.numprop = 0;
        this.objProp = {};
        this.arrProp = [];
        this.boolProp = false;
        
    }
    connectedCallback() {
        super.connectedCallback()
        //addEventListener('keydown', this._handleKeydown);
    }
    disconnectedCallback() {
        super.disconnectedCallback()
        //window.removeEventListener('keydown', this._handleKeydown);
    }
    shouldUpdate(changedProp) {
        if (changedProp.has('sprop')) {
            // do something with sprop change
        }
        return true;
    }
    render() {
        return html`
        <div></div>
        `
    }
    firstUpdated() {

    }
    updated() {

    }
}

customElements.define('template-component', TemplateComponent);