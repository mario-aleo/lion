import { LitElement } from '@lion/core';

/**
 * LionSelectRich: wraps the <lion-listbox> element
 *
 * @customElement
 * @extends LionField
 */
export class LionOptions extends LitElement {
  static get properties() {
    return {
      role: {
        type: String,
        reflect: true,
      },
    };
  }

  constructor() {
    super();
    this.role = 'listbox';
    this.tabIndex = 0;
  }

  createRenderRoot() {
    return this;
  }
}
