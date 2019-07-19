class FormRegistrationManager {
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
  // issue: https://gitlab.ing.net/TheGuideComponents/lion-element/issues/12
  _fakeExtendsEventTarget() {
    const delegate = document.createDocumentFragment();
    ['addEventListener', 'dispatchEvent', 'removeEventListener'].forEach(funcName => {
      this[funcName] = (...args) => delegate[funcName](...args);
    });
  }
}

export const formRegistrationManager = new FormRegistrationManager();
