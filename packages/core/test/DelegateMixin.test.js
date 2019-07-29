import { expect, fixture, defineCE, unsafeStatic, html } from '@open-wc/testing';
import sinon from 'sinon';
import { LionLitElement } from '../src/LionLitElement.js';
import { ObserverMixin } from '../src/ObserverMixin.js';

import { DelegateMixin } from '../src/DelegateMixin.js';

describe('DelegateMixin', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('delegates events', async () => {
    const tag = defineCE(
      class extends DelegateMixin(LionLitElement) {
        get delegations() {
          return {
            ...super.delegations,
            target: () => this.$id('button1'),
            events: ['click'],
          };
        }

        render() {
          return html`
            <button id="button1">with delegation</button>
          `;
        }
      },
    );
    const element = await fixture(`<${tag}></${tag}>`);
    const cb = sinon.spy();
    element.addEventListener('click', cb);
    element.$id('button1').click();
    expect(cb.callCount).to.equal(1);
  });

  it('delegates events before delegation target is attached to DOM', async () => {
    const tag = defineCE(
      class extends DelegateMixin(LionLitElement) {
        get delegations() {
          return {
            ...super.delegations,
            target: () => this.$id('button1'),
            events: ['click'],
          };
        }

        render() {
          return html`
            <button id="button1">with delegation</button>
          `;
        }
      },
    );
    const element = document.createElement(tag);
    const cb = sinon.spy();
    element.addEventListener('click', cb);
    document.body.appendChild(element);
    await element.updateComplete;
    element.$id('button1').click();
    expect(cb.callCount).to.equal(1);

    // cleanup
    document.body.removeChild(element);
  });

  it('delegates if light and shadow dom is used at the same time', async () => {
    const tag = defineCE(
      class extends DelegateMixin(LionLitElement) {
        get delegations() {
          return {
            ...super.delegations,
            target: () => this.$$slot('button'),
            events: ['click'],
            methods: ['click'],
          };
        }

        render() {
          return html`
            <span>Outside</span>
            <slot name="button2"></slot>
          `;
        }
      },
    );

    const element = await fixture(`
      <${tag}><button slot="button">click me</button></${tag}>`);
    const cb = sinon.spy();
    element.addEventListener('click', cb);
    element.$$slot('button').click();
    expect(cb.callCount).to.equal(1);
  });

  it('will still support other events', async () => {
    const tag = defineCE(
      class extends DelegateMixin(LionLitElement) {
        get delegations() {
          return {
            ...super.delegations,
            target: () => this.$id('button1'),
            events: ['click'],
          };
        }

        render() {
          return html`
            <button id="button1">with delegation</button>
          `;
        }

        foo() {
          this.dispatchEvent(new CustomEvent('foo-event', { bubbles: true, composed: true }));
        }
      },
    );
    const element = await fixture(`<${tag}></${tag}>`);
    const cb = sinon.spy();
    element.addEventListener('foo-event', cb);
    element.foo();
    expect(cb.callCount).to.equal(1);
  });

  it('will call delegated methods', async () => {
    const tag = defineCE(
      class extends DelegateMixin(LionLitElement) {
        get delegations() {
          return {
            ...super.delegations,
            target: () => this.$id('button1'),
            methods: ['click'],
          };
        }

        render() {
          return html`
            <button id="button1">with delegation</button>
          `;
        }
      },
    );
    const element = await fixture(`<${tag}></${tag}>`);
    const cb = sinon.spy();
    element.$id('button1').addEventListener('click', cb);
    element.click();
    expect(cb.callCount).to.equal(1);
  });

  it('supports arguments for delegated methods', async () => {
    class DelegateArgumentSub extends LionLitElement {
      constructor() {
        super();
        this.foo = { a: 'a', b: 'b' };
      }

      setFooAandB(a, b) {
        this.foo.a = a;
        this.foo.b = b;
      }
    }
    customElements.define('delegate-argument-sub', DelegateArgumentSub);
    const tag = defineCE(
      class extends DelegateMixin(LionLitElement) {
        get delegations() {
          return {
            ...super.delegations,
            target: () => this.$id('sub'),
            methods: ['setFooAandB'],
          };
        }

        render() {
          return html`
            <delegate-argument-sub id="sub"></delegate-argument-sub>
          `;
        }
      },
    );

    const element = await fixture(`<${tag}></${tag}>`);
    element.disabled = true;
    element.setFooAandB('newA', 'newB');
    expect(element.$id('sub').foo.a).to.equal('newA');
    expect(element.$id('sub').foo.b).to.equal('newB');
  });

  it('will set delegated properties', async () => {
    const tag = defineCE(
      class extends DelegateMixin(LionLitElement) {
        get delegations() {
          return {
            ...super.delegations,
            target: () => this.$id('button1'),
            properties: ['disabled'],
          };
        }

        render() {
          return html`
            <button id="button1">with delegation</button>
          `;
        }
      },
    );
    const element = await fixture(`<${tag}></${tag}>`);
    element.disabled = true;
    await element.updateComplete;
    expect(element.$id('button1').disabled).to.equal(true);
    expect(element.$id('button1').hasAttribute('disabled')).to.equal(true);
  });

  it('delegates properties before delegation target is attached to DOM', async () => {
    const tag = defineCE(
      class extends DelegateMixin(LionLitElement) {
        get delegations() {
          return {
            ...super.delegations,
            target: () => this.$id('button1'),
            properties: ['disabled'],
          };
        }

        render() {
          return html`
            <button id="button1">with delegation</button>
          `;
        }
      },
    );
    const element = document.createElement(tag);
    element.disabled = true;
    document.body.appendChild(element);
    await element.updateComplete;
    expect(element.$id('button1').disabled).to.equal(true);

    // cleanup
    document.body.removeChild(element);
  });

  it('will delegate setAttribute', async () => {
    const tag = defineCE(
      class extends DelegateMixin(LionLitElement) {
        get delegations() {
          return {
            ...super.delegations,
            target: () => this.$id('button1'),
            attributes: ['disabled'],
          };
        }

        render() {
          return html`
            <button id="button1">with delegation</button>
          `;
        }
      },
    );
    const element = await fixture(`<${tag}></${tag}>`);
    element.setAttribute('disabled', '');
    await element.updateComplete;
    expect(element.hasAttribute('disabled')).to.equal(false);
    expect(element.$id('button1').hasAttribute('disabled')).to.equal(true);
  });

  it('will read inital attributes', async () => {
    const tag = defineCE(
      class extends DelegateMixin(LionLitElement) {
        get delegations() {
          return {
            ...super.delegations,
            target: () => this.$id('button1'),
            attributes: ['disabled'],
          };
        }

        render() {
          return html`
            <button id="button1">with delegation</button>
          `;
        }
      },
    );
    const element = await fixture(`<${tag} disabled></${tag}>`);
    expect(element.hasAttribute('disabled')).to.equal(false);
    expect(element.$id('button1').hasAttribute('disabled')).to.equal(true);
  });

  it('will delegate removeAttribute', async () => {
    const tag = defineCE(
      class extends DelegateMixin(LionLitElement) {
        get delegations() {
          return {
            ...super.delegations,
            target: () => this.$id('button1'),
            attributes: ['disabled'],
          };
        }

        render() {
          return html`
            <button id="button1">with delegation</button>
          `;
        }
      },
    );
    const element = await fixture(`<${tag} disabled></${tag}>`);
    element.removeAttribute('disabled', '');
    await element.updateComplete;
    expect(element.hasAttribute('disabled')).to.equal(false);
    expect(element.$id('button1').hasAttribute('disabled')).to.equal(false);
  });

  it('respects user defined values for delegated attributes and properties', async () => {
    const tag = defineCE(
      class extends DelegateMixin(LionLitElement) {
        get delegations() {
          return {
            ...super.delegations,
            // this just means itś config is set to the queue when called before connectedCallback
            target: () => this.scheduledElement,
            attributes: ['type'],
            properties: ['type'],
          };
        }

        get scheduledElement() {
          return this.querySelector('input');
        }

        constructor() {
          super();
          this.type = 'email'; // 1. here we set the delegated prop and it should be scheduled
        }

        connectedCallback() {
          // 2. this is where we add teh delegation target (so after 1)
          this.appendChild(document.createElement('input'));
          super.connectedCallback(); // let the DelegateMixin do its work
        }
      },
    );
    const tagName = unsafeStatic(tag);
    // Here, the Application Developerd tries to set the type via attribute
    const elementAttr = await fixture(`<${tag} type="radio"></${tag}>`);
    expect(elementAttr.scheduledElement.type).to.equal('radio');
    // Here, the Application Developer tries to set the type via property
    const elementProp = await fixture(html`<${tagName} .type=${'radio'}></${tagName}>`);
    expect(elementProp.scheduledElement.type).to.equal('radio');
  });

  it(`uses attribute value as a fallback for delegated property getter
    when property not set by user and delegationTarget not ready`, async () => {
    const tag = defineCE(
      class extends DelegateMixin(LionLitElement) {
        get delegations() {
          return {
            ...super.delegations,
            target: () => this.delegatedEl,
            properties: ['type'],
            attributes: ['type'],
          };
        }

        get delegatedEl() {
          // returns null, so we can test that "cached" attr is used as fallback
          return null;
        }
      },
    );
    const element = await fixture(`<${tag} type="radio"></${tag}>`);
    expect(element.delegatedEl).to.equal(null);
    expect(element.type).to.equal('radio'); // value retrieved from host instead of delegatedTarget
  });

  it('works with connectedCallback', async () => {
    const tag = await defineCE(
      class extends DelegateMixin(HTMLElement) {
        get delegations() {
          return {
            ...super.delegations,
            target: () => this.querySelector('div'),
            properties: ['foo'],
          };
        }
      },
    );
    const element = await fixture(`<${tag}><div></div></${tag}>`);
    element.foo = 'new';
    expect(element.querySelector('div').foo).to.equal('new');
  });

  it('works with shadow dom', async () => {
    const tag = await defineCE(
      class extends DelegateMixin(LionLitElement) {
        get delegations() {
          return {
            ...super.delegations,
            target: () => this.shadowRoot.querySelector('div'),
            properties: ['foo'],
          };
        }

        render() {
          return html`
            <div></div>
          `;
        }
      },
    );
    const element = await fixture(`<${tag}></${tag}>`);
    element.foo = 'new';
    expect(element.shadowRoot.querySelector('div').foo).to.equal('new');
  });

  it('works with light dom', async () => {
    const tag = await defineCE(
      class extends DelegateMixin(LionLitElement) {
        get delegations() {
          return {
            ...super.delegations,
            target: () => this.querySelector('div'),
            properties: ['foo'],
          };
        }

        createRenderRoot() {
          return this;
        }

        render() {
          return html`
            <div></div>
          `;
        }
      },
    );
    const element = await fixture(`<${tag}></${tag}>`);
    element.foo = 'new';
    expect(element.querySelector('div').foo).to.equal('new');
  });

  it('integrates with the Observer System', async () => {
    const tag = await defineCE(
      class extends DelegateMixin(ObserverMixin(LionLitElement)) {
        get delegations() {
          return {
            ...super.delegations,
            target: () => this.querySelector('div'),
            properties: ['size'],
          };
        }

        static get syncObservers() {
          return { _onSyncSizeChanged: ['size'] };
        }

        static get asyncObservers() {
          return { _onAsyncSizeChanged: ['size'] };
        }

        render() {
          return html`
            <div></div>
          `;
        }

        createRenderRoot() {
          return this;
        }

        _onSyncSizeChanged() {}

        _onAsyncSizeChanged() {}
      },
    );
    const el = await fixture(`<${tag}><div></div></${tag}>`);
    const asyncSpy = sinon.spy(el, '_onAsyncSizeChanged');
    const syncSpy = sinon.spy(el, '_onSyncSizeChanged');

    el.size = 'tiny';
    expect(syncSpy.callCount).to.equal(1);
    expect(syncSpy.calledWith({ size: 'tiny' }, { size: undefined })).to.be.true;
    el.size = 'big';
    expect(syncSpy.callCount).to.equal(2);
    expect(syncSpy.calledWith({ size: 'big' }, { size: 'tiny' })).to.be.true;
    expect(asyncSpy.callCount).to.equal(0);

    await el.updateComplete;
    expect(syncSpy.callCount).to.equal(2);
    expect(asyncSpy.callCount).to.equal(1);
    expect(asyncSpy.calledWith({ size: 'big' }, { size: undefined })).to.be.true;

    el.size = 'medium';
    await el.updateComplete;
    expect(syncSpy.callCount).to.equal(3);
    expect(syncSpy.calledWith({ size: 'medium' }, { size: 'big' })).to.be.true;
    expect(asyncSpy.callCount).to.equal(2);
    expect(asyncSpy.calledWith({ size: 'medium' }, { size: 'big' })).to.be.true;

    // we expect to NOT use an "internal" property
    // TODO: double check if we test the right thing here
    expect(el.constructor._classProperties.get('size')).to.be.undefined;
  });
});
