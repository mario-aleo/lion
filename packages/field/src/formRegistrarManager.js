/**
 * Allows to align the timing for all Registrars (like form, fieldset).
 * e.g. it will only be ready once all Registrars have been fully rendered
 *
 * This is a requirement for ShadyDOM as otherwise forms can not catch registration events
 */
class FormRegistrarManager {
  constructor() {
    this.__elements = [];
    this._fakeExtendsEventTarget();
    this.ready = false;
  }

  add(registrar) {
    this.__elements.push(registrar);
    this.ready = false;
  }

  becomesReady() {
    if (this.__elements.every(el => el.__readyForRegistration === true)) {
      this.dispatchEvent(new Event('all-forms-open-for-registration'));
      this.ready = true;
    }
  }

  // TODO: this method has to be removed when EventTarget polyfill is available on IE11
  _fakeExtendsEventTarget() {
    const delegate = document.createDocumentFragment();
    ['addEventListener', 'dispatchEvent', 'removeEventListener'].forEach(funcName => {
      this[funcName] = (...args) => delegate[funcName](...args);
    });
  }
}

export const formRegistrarManager = new FormRegistrarManager();
