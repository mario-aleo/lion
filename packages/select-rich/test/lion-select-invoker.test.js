import { expect, fixture, html, defineCE } from '@open-wc/testing';
import { LionButton } from '@lion/button';
import { LionSelectInvoker } from '../src/LionSelectInvoker.js';

import '../lion-select-invoker.js';

describe('lion-select-invoker', () => {
  it('should behave as a button', async () => {
    const el = await fixture(html`
      <lion-select-invoker></lion-select-invoker>
    `);
    expect(el instanceof LionButton).to.be.true;
  });

  it('renders invoker info based on selectedElement child elements', async () => {
    const el = await fixture(html`
      <lion-select-invoker></lion-select-invoker>
    `);
    el.selectedElement = await fixture(`<div class="option"><h2>I am</h2><p>2 lines</p></div>`);
    await el.updateComplete;

    expect(el.contentWrapper).lightDom.to.equal(`
      <h2>I am</h2>
      <p>2 lines</p>
    `);
  });

  it('renders invoker info based on selectedElement textContent', async () => {
    const el = await fixture(html`
      <lion-select-invoker></lion-select-invoker>
    `);
    el.selectedElement = await fixture(`<div class="option">just textContent</div>`);
    await el.updateComplete;

    expect(el.contentWrapper).lightDom.to.equal('just textContent');
  });

  it('has tabindex="0"', async () => {
    const el = await fixture(html`
      <lion-select-invoker></lion-select-invoker>
    `);
    expect(el.tabIndex).to.equal(0);
    expect(el.getAttribute('tabindex')).to.equal('0');
  });

  describe.skip('Subclassers', () => {
    it('can create complex custom invoker renderers', async () => {
      const nodes = [];

      for (let i = 0; i < 2; i += 1) {
        const myNode = document.createElement('div');
        myNode.propX = `x${i}`;
        myNode.propY = `y${i}`;
        nodes.push(myNode);
      }

      // TODO: pseudo code: api for multiple selected might change
      const myTag = defineCE(
        class extends LionSelectInvoker {
          constructor() {
            super();
            this.selectedElements = nodes;
          }

          _contentTemplate() {
            // Display multi-select as chips
            return html`
              <div>
                ${this.selectedElements.forEach(
                  sEl => html`
                    <div class="c-chip">
                      ${sEl.propX}
                      <span class="c-chip__part">
                        ${sEl.propY}
                      </span>
                    </div>
                  `,
                )}
              </div>
            `;
          }
        },
      );

      const myEl = await fixture(`<${myTag}></${myTag}>`);
      // pseudo...
      expect(myEl).lightDom.to.contain('x1');
      expect(myEl).lightDom.to.contain('x2');
      expect(myEl).lightDom.to.contain('y1');
      expect(myEl).lightDom.to.contain('y2');
    });
  });
});
