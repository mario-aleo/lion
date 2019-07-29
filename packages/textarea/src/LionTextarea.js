import autosize from 'autosize/src/autosize.js';
import { LionInput } from '@lion/input';
import { css } from '@lion/core';
import { ObserverMixin } from '@lion/core/src/ObserverMixin.js';

/**
 * LionTextarea: extension of lion-field with native input element in place and user friendly API
 *
 * @customElement
 * @extends LionInput
 */
export class LionTextarea extends ObserverMixin(LionInput) {
  static get properties() {
    return {
      ...super.properties,
      maxRows: {
        type: Number,
        attribute: 'max-rows',
      },
    };
  }

  get delegations() {
    return {
      ...super.delegations,
      target: () => this.inputElement,
      properties: [...super.delegations.properties, 'rows'],
      attributes: [...super.delegations.attributes, 'rows'],
    };
  }

  static get asyncObservers() {
    return {
      ...super.asyncObservers,
      resizeTextarea: ['maxRows', 'modelValue'],
      setTextareaMaxHeight: ['maxRows', 'rows'],
    };
  }

  get slots() {
    return {
      ...super.slots,
      input: () => {
        const input = document.createElement('textarea');

        // disable user resize behavior if browser supports it
        if (input.style.resize !== undefined) {
          input.style.resize = 'none';
        }

        return input;
      },
    };
  }

  constructor() {
    super();
    this.rows = 2;
    this.maxRows = 6;
  }

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();
    this.__initializeAutoresize();
  }

  disconnectedCallback() {
    autosize.destroy(this.inputElement);
  }

  /**
   * To support maxRows we need to set max-height of the textarea
   */
  setTextareaMaxHeight() {
    const { value } = this.inputElement;
    this.inputElement.value = '';
    this.resizeTextarea();

    const cs = window.getComputedStyle(this.inputElement, null);
    const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.height) / this.rows;
    const paddingOffset = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const borderOffset = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    const offset = cs.boxSizing === 'border-box' ? paddingOffset + borderOffset : 0;

    this.inputElement.style.maxHeight = `${lineHeight * this.maxRows + offset}px`;

    this.inputElement.value = value;
    this.resizeTextarea();
  }

  static get styles() {
    return [
      ...super.styles,
      css`
        .input-group__container > .input-group__input ::slotted(.form-control) {
          overflow-x: hidden; /* for FF adds height to the TextArea to reserve place for scroll-bars */
        }
      `,
    ];
  }

  get updateComplete() {
    if (this.__textareaUpdateComplete) {
      return Promise.all([this.__textareaUpdateComplete, super.updateComplete]);
    }
    return super.updateComplete;
  }

  resizeTextarea() {
    autosize.update(this.inputElement);
  }

  __initializeAutoresize() {
    if (this.__shady_native_contains) {
      this.__textareaUpdateComplete = this.__waitForTextareaRenderedInRealDOM().then(() => {
        this.__startAutoresize();
        this.__textareaUpdateComplete = null;
      });
    } else {
      this.__startAutoresize();
    }
  }

  async __waitForTextareaRenderedInRealDOM() {
    let count = 3; // max tasks to wait for
    while (count !== 0 && !this.__shady_native_contains(this.inputElement)) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise(resolve => setTimeout(resolve));
      count -= 1;
    }
  }

  __startAutoresize() {
    autosize(this.inputElement);
    this.setTextareaMaxHeight();
  }
}
