import { html, css, LitElement, SlotMixin } from '@lion/core';
import { LocalOverlayController, overlays } from '@lion/overlays';
import { FormControlMixin, InteractionStateMixin } from '@lion/field';
import { ValidateMixin } from '@lion/validate';

// import { ListboxMixin } from './ListboxMixin.js';
// import { GroupMixin } from './GroupMixin.js';

import '../lion-select-invoker.js';

function uuid() {
  return Math.random()
    .toString(36)
    .substr(2, 10);
}

function detectInteractionMode() {
  if (navigator.appVersion.indexOf('Mac') !== -1) {
    return 'mac';
  }
  return 'default';
}

/**
 * LionSelectRich: wraps the <lion-listbox> element
 *
 * @customElement
 * @extends LionField
 */
export class LionSelectRich extends InteractionStateMixin(
  ValidateMixin(FormControlMixin(SlotMixin(LitElement))),
) {
  static get properties() {
    return {
      ...super.properties,
      checkedValue: {
        type: Object,
      },

      disabled: {
        type: Boolean,
        reflect: true,
      },

      opened: {
        type: Boolean,
        reflect: true,
      },

      interactionMode: {
        type: String,
        attribute: 'interaction-mode',
      },

      modelValue: {
        type: Array,
      },

      name: {
        type: String,
      },
    };
  }

  // static get styles() {
  //   return [
  //     css`
  //       .input-group__input {
  //         display: block;
  //       }
  //     `,
  //   ];
  // }

  static _isPrefilled(modelValue) {
    if (!modelValue) {
      return false;
    }
    const checkedModelValue = modelValue.find(subModelValue => subModelValue.checked === true);
    if (!checkedModelValue) {
      return false;
    }

    const { value } = checkedModelValue;
    return super._isPrefilled(value);
  }

  get slots() {
    return {
      ...super.slots,
      invoker: () => {
        return document.createElement('lion-select-invoker');
      },
    };
  }

  get _invokerNode() {
    return this.querySelector('[slot=invoker]');
  }

  constructor() {
    super();
    this.interactionMode = 'auto';
    this.formElements = [];
    this.disabled = false;
    this.opened = false;

    this.__boundOnFormElementsRegister = this.__onFormElementRegister.bind(this);
    this.__boundOnFormElementUnRegister = this.__onFormElementUnRegister.bind(this);
    this.__boundOnOptionActiveChanged = this.__onOptionActiveChanged.bind(this);
    // this.__boundOnOptionCheckedChanged = this.__onOptionCheckedChanged.bind(this);

    // this.__onModelValueChanged = this.__onModelValueChanged.bind(this);
    this.__boundOnChildModelValueChanged = this.__onChildModelValueChanged.bind(this);

    // for interaction states
    this._valueChangedEvent = 'select-model-value-changed';

    this._listboxActiveDescendant = null;

    this.__listboxOnKeyDown = this.__listboxOnKeyDown.bind(this);
    this.__boundOnKeyDown = this.__onKeyDown.bind(this);

    this.__boundToggle = this.toggle.bind(this);
  }

  __setupPostConnectedEventListener() {
    /* for __overlay */
    this.__overlayOnShow = () => {
      this.opened = true;
    };
    this.__overalyOnHide = () => {
      this.opened = false;
    };

    this.__overlay.addEventListener('show', this.__overlayOnShow);
    this.__overlay.addEventListener('hide', this.__overalyOnHide);

    /* for _invokerNode */
    this.__invokerOnClick = () => {
      if (!this.disabled) {
        this.toggle();
      }
    };
    this._invokerNode.addEventListener('click', this.__invokerOnClick);

    this.__invokerOnBlur = () => {
      this.dispatchEvent(new Event('blur'));
    };
    this._invokerNode.addEventListener('blur', this.__invokerOnBlur);
  }

  get _listboxNode() {
    return this.querySelector('[slot=input]');
  }

  updated(changedProps) {
    super.updated(changedProps);
    if (changedProps.has('opened')) {
      if (this.opened) {
        this.__overlay.show();
      } else {
        this.__overlay.hide();
      }
    }

    if (changedProps.has('disabled')) {
      // TODO: improve implementation -> property, seprate Mixin?
      if (this.disabled) {
        this.__originalTabIndex = this.tabIndex;
        this.tabIndex = -1;
      } else {
        this.tabIndex = this.__originalTabIndex;
      }
    }
  }

  toggle() {
    this.opened = !this.opened;
  }

  __setupOverlay() {
    this.__overlay = overlays.add(
      new LocalOverlayController({
        hidesOnEsc: false,
        hidesOnOutsideClick: true,
        contentNode: this._listboxNode,
        invokerNode: this._invokerNode,
      }),
    );
  }

  /**
   * Overwrite of FormControlMixin, add same aria-label to invokerNode as inputElement
   */
  _onAriaLabelledbyChanged({ _ariaLabelledby }) {
    if (this.inputElement) {
      this.inputElement.setAttribute('aria-labelledby', _ariaLabelledby);
    }
    if (this._invokerNode) {
      this._invokerNode.setAttribute(
        'aria-labelledby',
        `${_ariaLabelledby} ${this._invokerNode.id}`,
      );
    }
  }

  /**
   * Overwrite of FormControlMixin, add same aria-description to invokerNode as inputElement
   */
  _onAriaDescribedbyChanged({ _ariaDescribedby }) {
    if (this.inputElement) {
      this.inputElement.setAttribute('aria-describedby', _ariaDescribedby);
    }
    if (this._invokerNode) {
      this._invokerNode.setAttribute('aria-describedby', _ariaDescribedby);
    }
  }

  /**
   * @override
   */
  // eslint-disable-next-line
  inputGroupInputTemplate() {
    return html`
      <div class="input-group__input">
        <slot name="invoker"></slot>
        <slot name="input"></slot>
      </div>
    `;
  }

  inputGroupTemplate() {
    return html`
      <div class="input-group">
        ${this.inputGroupBeforeTemplate()}
        <div class="input-group__container">
          ${this.inputGroupPrefixTemplate()} ${this.inputGroupInputTemplate()}
          ${this.inputGroupSuffixTemplate()}
        </div>
        ${this.inputGroupAfterTemplate()}
      </div>
    `;
  }

  __onOptionActiveChanged({ target }) {
    if (target.active === true) {
      this.formElements.forEach(formElement => {
        if (formElement !== target) {
          formElement.active = false;
        }
      });
      this._listboxNode.setAttribute('aria-activedescendant', target.id);
    }
  }

  // __onOptionCheckedChanged({ target }) {
  //   if (target.checked === true) {
  //     this.formElements.forEach(formElement => {
  //       if (formElement !== target) {
  //         formElement.checked = false;
  //       }
  //     });
  //   }
  // }

  connectedCallback() {
    super.connectedCallback(); // eslint-disable-line wc/guard-super-call
    this.addEventListener('form-element-register', this.__boundOnFormElementsRegister);
    this.addEventListener('form-element-unregister', this.__boundOnFormElementUnRegister);
    this.addEventListener('active-changed', this.__boundOnOptionActiveChanged);
    this.addEventListener('checked-changed', this.__boundOnOptionCheckedChanged);

    this.addEventListener('model-value-changed', this.__boundOnChildModelValueChanged);
    this.addEventListener('keydown', this.__listboxOnKeyDown);

    this.addEventListener('keydown', this.__boundOnKeyDown);

    this.__setupOverlay();
    this.__userTabIndex = this.tabIndex;

    this._invokerNode.id = `invoker-${this._inputId}`;
    this._invokerNode.setAttribute('aria-haspopup', 'listbox');

    this.__setupPostConnectedEventListener();
  }

  _requestUpdate(name, oldValue) {
    super._requestUpdate(name, oldValue);
    if (
      name === 'checkedValue' &&
      !this.__isSyncingCheckedAndModelValue &&
      this.modelValue &&
      this.modelValue.length > 0
    ) {
      if (this.checkedIndex) {
        this.checkedIndex = this.checkedIndex;
      }
    }

    if (name === 'modelValue') {
      this.dispatchEvent(new CustomEvent('select-model-value-changed'));
      this.__onModelValueChanged();
    }

    if (name === 'interactionMode') {
      if (this.interactionMode === 'auto') {
        this.interactionMode = detectInteractionMode();
      }
    }
  }

  get checkedIndex() {
    return this.modelValue.findIndex(el => el.value === this.checkedValue);
  }

  set checkedIndex(index) {
    if (this.formElements[index]) {
      this.formElements[index].checked = true;
    }
  }

  get activeIndex() {
    return this.formElements.findIndex(el => el.active === true);
  }

  set activeIndex(index) {
    if (this.formElements[index]) {
      this.formElements[index].active = true;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback(); // eslint-disable-line wc/guard-super-call
    this.removeEventListener('form-element-register', this.__boundOnFormElementsRegister);
    this.removeEventListener('form-element-unregister', this.__boundOnFormElementUnRegister);
    if (this.__parentFormGroup) {
      const event = new CustomEvent('form-element-unregister', {
        detail: { element: this },
        bubbles: true,
      });
      this.__parentFormGroup.dispatchEvent(event);
    }

    // // GroupMixin
    // this.removeEventListener('model-value-changed', this.__onModelValueChanged);
  }

  isRegisteredFormElement(el) {
    return Object.keys(this.formElements).some(name => el.name === name);
  }

  __onFormElementUnRegister(event) {
    // TODO
  }

  __onFormElementRegister(event) {
    const child = event.detail.element;
    if (child === this) return; // as we fire and listen - don't add ourselves
    event.stopPropagation();

    child.id = child.id || `${this.localName}-option-${uuid()}`;
    // This is a way to let the child element (a lion-fieldset or lion-field) know, about its parent
    child.__parentFormGroup = this;

    if (this.disabled) {
      child.disabled = true;
    }
    if (this.formElements.length === 0) {
      child.active = true;
      child.checked = true;
    }

    this.formElements.push(child);

    this.__setAttributeForAllFormElements('aria-setsize', this.formElements.length);
    child.setAttribute('aria-posinset', this.formElements.length);

    this.__onChildModelValueChanged({ target: child });
    this.resetInteractionState();
  }

  __setAttributeForAllFormElements(attribute, value) {
    this.formElements.forEach(formElement => {
      formElement.setAttribute(attribute, value);
    });
  }

  _getFromAllFormElements(property) {
    return this.formElements.map(e => e[property]);
  }

  __onChildModelValueChanged({ target }) {
    if (target.checked) {
      this.formElements.forEach(formElement => {
        if (formElement !== target) {
          formElement.checked = false;
        }
      });
    }
    // Uncheck others if not multiselect. TODO: move to listbox
    // this.__listboxUnCheckOthers(target);
    this.modelValue = this._getFromAllFormElements('modelValue');
  }

  __onModelValueChanged() {
    this.__isSyncingCheckedAndModelValue = true;

    const foundChecked = this.modelValue.find(subModelValue => subModelValue.checked);
    if (foundChecked && foundChecked.value !== this.checkedValue) {
      this.checkedValue = foundChecked.value;

      // sync to invoker
      this._invokerNode.selectedElement = this.formElements[this.checkedIndex];
    }

    this.__isSyncingCheckedAndModelValue = false;
  }

  // **********************************************************************************************
  // ******************************* extract later to ListBoxMixin ********************************
  // **********************************************************************************************

  get _listboxActiveDescendantNode() {
    return this._listboxNode.querySelector(`#${this._listboxActiveDescendant}`);
  }

  firstUpdated() {
    super.firstUpdated();
    this.shadowRoot.querySelector('slot[name=input]').addEventListener('slotchange', () => {
      this._listboxNode.role = 'listbox';
      this._listboxNode.tabIndex = -1;
      this._listboxNode.addEventListener('click', () => {
        this.opened = false;
      });
    });
  }

  /**
   * @desc
   * Handle various keyboard controls; UP/DOWN will shift focus; SPACE selects
   * an item.
   *
   * @param ev - the keydown event object
   */
  __listboxOnKeyDown(ev) {
    if (this.disabled) {
      return;
    }
    if (this.interactionMode === 'mac' && !this.opened) {
      return;
    }

    const keys = ['ArrowUp', 'ArrowDown', 'Home', 'End'];
    const { key } = ev;
    if (!keys.includes(key)) {
      return;
    }

    ev.preventDefault();
    switch (key) {
      case 'ArrowUp':
        this.activeIndex -= 1;
        break;
      case 'ArrowDown':
        this.activeIndex += 1;
        break;
      case 'Home':
        this.activeIndex = 0;
        break;
      case 'End':
        this.activeIndex = this.formElements.length - 1;
        break;
      /* no default */
    }

    if (this.interactionMode === 'default') {
      this.checkedIndex = this.activeIndex;
    }
  }

  __onKeyDown(ev) {
    if (this.disabled) {
      return;
    }

    const { key } = ev;
    switch (key) {
      case 'Enter':
      case ' ':
        ev.preventDefault();
        if (this.interactionMode === 'mac') {
          this.checkedIndex = this.activeIndex;
        }
        // toggle will be triggered by click handler
        break;
      case 'Escape':
      case 'Tab':
        if (this.opened) {
          ev.preventDefault();
          this.opened = false;
        }
        break;
      case 'ArrowUp':
        ev.preventDefault();
        if (this.interactionMode === 'mac') {
          this.opened = true;
        }
        break;
      case 'ArrowDown':
        ev.preventDefault();
        if (this.interactionMode === 'mac') {
          this.opened = true;
        }
        break;
      /* no default */
    }
  }

  // eslint-disable-next-line class-methods-use-this
  __isRequired(modelValue) {
    const checkedModelValue = modelValue.find(subModelValue => subModelValue.checked === true);
    if (!checkedModelValue) {
      return { required: false };
    }
    const { value } = checkedModelValue;
    return {
      required:
        (typeof value === 'string' && value !== '') ||
        (typeof value !== 'string' && value !== undefined && value !== null),
    };
  }

  __listBoxScrollCorrection(option) {
    if (this._listboxNode.scrollHeight > this._listboxNode.clientHeight) {
      const scrollBottom = this._listboxNode.clientHeight + this._listboxNode.scrollTop;
      const optionBottom = option.offsetTop + option.offsetHeight;
      if (optionBottom > scrollBottom) {
        this._listboxNode.scrollTop = optionBottom - this._listboxNode.clientHeight;
      } else if (option.offsetTop < this._listboxNode.scrollTop) {
        this._listboxNode.scrollTop = option.offsetTop;
      }
    }
  }
}
