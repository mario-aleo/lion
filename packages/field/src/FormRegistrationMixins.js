import { dedupeMixin } from '@lion/core';
import { formRegistrationManager } from './formRegistrationManager';

/**
 * #RegisterFormElementMixin :
 *
 * This Mixin registers form elements, it's applied on:
 * - FormControlMixin (which is extended to LionField, LionInput, LionTextarea, LionSelect etc. etc.)
 *
 * @polymerMixin
 * @mixinFunction
 */
export const FormRegisteringMixin = dedupeMixin(
  superclass =>
    // eslint-disable-next-line no-shadow, no-unused-vars
    class FormRegisteringMixin extends superclass {
      connectedCallback() {
        if (super.connectedCallback) {
          super.connectedCallback();
        }
        this.__setupRegistrationHook();
      }

      disconnectedCallback() {
        if (super.disconnectedCallback) {
          super.disconnectedCallback();
        }
        this._unregisterFormElement();
      }

      __setupRegistrationHook() {
        if (formRegistrationManager.ready) {
          this._registerFormElement();
        } else {
          formRegistrationManager.addEventListener('all-forms-open-for-registration', () => {
            this._registerFormElement();
          });
        }
      }

      _registerFormElement() {
        this._dispatchRegistration();
        this._requestParentFormGroupUpdateOfResetModelValue();
      }

      _dispatchRegistration() {
        this.dispatchEvent(
          new CustomEvent('form-element-register', {
            detail: { element: this },
            bubbles: true,
          }),
        );
      }

      _unregisterFormElement() {
        if (this.__parentFormGroup) {
          this.__parentFormGroup.removeFormElement(this);
        }
      }

      /**
       * Makes sure our parentFormGroup has the most up to date resetModelValue
       * FormGroups will call the same on their parentFormGroup so the full tree gets the correct
       * values.
       */
      _requestParentFormGroupUpdateOfResetModelValue() {
        if (this.__parentFormGroup && this.__parentFormGroup._updateResetModelValue) {
          this.__parentFormGroup._updateResetModelValue();
        }
      }
    },
);

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
        formRegistrationManager.add(this);

        this._onRequestToAddFormElement = this._onRequestToAddFormElement.bind(this);
        this.addEventListener('form-element-register', this._onRequestToAddFormElement);
      }

      isRegisteredFormElement(el) {
        return this.formElementsArray.some(exitingEl => exitingEl === el);
      }

      firstUpdated(c) {
        super.firstUpdated(c);
        this.__resolveRegistrationReady();
        this.__readyForRegistration = true;
        formRegistrationManager.becomesReady(this);
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
