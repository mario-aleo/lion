import { LionButton } from '@lion/button';
import { html, css } from '@lion/core';

/**
 * LionSelectInvoker: invoker button consuming a selected element
 *
 * @customElement
 * @extends LionButton
 */
// eslint-disable-next-line no-unused-vars
export class LionSelectInvoker extends LionButton {
  static get styles() {
    return [
      // ...super.styles,
      css`
        :host {
          background-color: lightgray;
          display: block;
          padding: 8px;
        }

        /* sr-only */
        :host ::slotted(button) {
          position: absolute;
          visibility: hidden;
          top: 0;
        }
      `,
    ];
  }

  static get properties() {
    return {
      selectedElement: {
        type: Object,
      },
    };
  }

  get contentWrapper() {
    return this.shadowRoot.getElementById('content-wrapper');
  }

  constructor() {
    super();
    this.selectedElement = null;
  }

  _contentTemplate() {
    if (this.selectedElement) {
      const labelNodes = Array.from(this.selectedElement.querySelectorAll('*'));
      if (labelNodes.length > 0) {
        return labelNodes.map(node => node.cloneNode(true));
      }
      return this.selectedElement.textContent;
    }
    return ``;
  }

  render() {
    return html`
      <div class="btn">
        <div id="content-wrapper">
          ${this._contentTemplate()}
        </div>

        <slot></slot>
        <slot name="_button"></slot>
        <div class="click-area" @click="${this.__clickDelegationHandler}"></div>
      </div>
    `;
  }
}
