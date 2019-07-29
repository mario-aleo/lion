import { dedupeMixin } from '@lion/core';
import { formRegistrarManager } from './formRegistrarManager.js';
import { FormRegisteringMixin } from './FormRegisteringMixin.js';

/**
 * This allows an element to become the manager of a register
 */
export const FormRegistrarMixin = dedupeMixin(
  superclass =>
    // eslint-disable-next-line no-shadow, no-unused-vars
    class FormRegistrarMixin extends FormRegisteringMixin(superclass) {
      get formElements() {
        return this.__formElements;
      }

      set formElements(value) {
        this.__formElements = value;
      }

      get formElementsArray() {
        return this.__formElements;
      }

      constructor() {
        super();
        this.formElements = [];
        this.__readyForRegistration = false;
        this.registrationReady = new Promise(resolve => {
          this.__resolveRegistrationReady = resolve;
        });
        formRegistrarManager.add(this);

        this._onRequestToAddFormElement = this._onRequestToAddFormElement.bind(this);
        this.addEventListener('form-element-register', this._onRequestToAddFormElement);
      }

      isRegisteredFormElement(el) {
        return this.formElementsArray.some(exitingEl => exitingEl === el);
      }

      firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);
        this.__resolveRegistrationReady();
        this.__readyForRegistration = true;
        formRegistrarManager.becomesReady(this);
      }

      addFormElement(child) {
        // This is a way to let the child element (a lion-fieldset or lion-field) know, about its parent
        // eslint-disable-next-line no-param-reassign
        child.__parentFormGroup = this;

        this.formElements.push(child);
      }

      removeFormElement(child) {
        const index = this.formElements.indexOf(child);
        if (index > -1) {
          this.formElements.splice(index, 1);
        }
      }

      _onRequestToAddFormElement(ev) {
        const child = ev.detail.element;
        if (child === this) {
          // as we fire and listen - don't add ourselves
          return;
        }
        if (this.isRegisteredFormElement(child)) {
          // do not readd already existing elements
          return;
        }
        ev.stopPropagation();
        this.addFormElement(child);
      }

      _onRequestToRemoveFormElement(ev) {
        const child = ev.detail.element;
        if (child === this) {
          // as we fire and listen - don't add ourselves
          return;
        }
        if (!this.isRegisteredFormElement(child)) {
          // do not readd already existing elements
          return;
        }
        ev.stopPropagation();

        this.removeFormElement(child);
      }
    },
);
