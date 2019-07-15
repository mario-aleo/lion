import { storiesOf, html } from '@open-wc/demoing-storybook';
import { css } from '@lion/core';

import '@lion/form/lion-form.js';
import '@lion/option/lion-option.js';

import '../lion-select-rich.js';
import '../lion-options.js';

const selectRichDemoStyle = css`
  .demo-listbox {
    background-color: white;
  }

  .demo-option[focused] {
    background-color: lightgray;
  }
`;

storiesOf('Forms|Select Rich', module)
  .add(
    'Default',
    () => html`
      <style>
        ${selectRichDemoStyle}
      </style>
      <lion-select-rich label="Favorite color" name="color">
        <lion-options slot="input">
          <lion-option .modelValue=${{ value: 'red', checked: false }}>Red</lion-option>
          <lion-option .modelValue=${{ value: 'hotpink', checked: true }}>Hotpink</lion-option>
          <lion-option .modelValue=${{ value: 'teal', checked: false }}>Teal</lion-option>
        </lion-options>
      </lion-select-rich>
    `,
  )
  .add(
    'Options with HTML',
    () => html`
      <style>
        ${selectRichDemoStyle}
      </style>
      <lion-select-rich label="Favorite color" name="color">
        <lion-options slot="input" class="demo-listbox">
          <lion-option .modelValue=${{ value: 'red', checked: false }}>
            <p style="color: red;">I am red</p>
            <p>and multi Line</p>
          </lion-option>
          <lion-option .modelValue=${{ value: 'hotpink', checked: true }}>
            <p style="color: hotpink;">I am hotpink</p>
            <p>and multi Line</p>
          </lion-option>
          <lion-option .modelValue=${{ value: 'teal', checked: false }}>
            <p style="color: teal;">I am teal</p>
            <p>and multi Line</p>
          </lion-option>
        </lion-options>
      </lion-select-rich>
    `,
  )
  .add(
    'Disabled',
    () => html`
      <style>
        ${selectRichDemoStyle}
      </style>
      <style>
        ${selectRichDemoStyle}
      </style>
      <lion-select-rich label="Disabled select" disabled name="color">
        <lion-options slot="input">
          <lion-option .modelValue=${{ value: 'red', checked: false }}>Red</lion-option>
          <lion-option .modelValue=${{ value: 'hotpink', checked: true }}>Hotpink</lion-option>
          <lion-option .modelValue=${{ value: 'teal', checked: false }}>Teal</lion-option>
        </lion-options>
      </lion-select-rich>

      <lion-select-rich label="Disabled options" name="color">
        <lion-options slot="input">
          <lion-option .modelValue=${{ value: 'red', checked: false }}>Red</lion-option>
          <lion-option .modelValue=${{ value: 'hotpink', checked: true }}>Hotpink</lion-option>
          <lion-option .modelValue=${{ value: 'teal', checked: false }} disabled>Teal</lion-option>
        </lion-options>
      </lion-select-rich>
    `,
  )
  .add('Validation', () => {
    const submit = () => {
      const form = document.querySelector('#form');
      if (form.errorState === false) {
        console.log(form.serializeGroup());
      }
    };
    return html`
      <style>
        ${selectRichDemoStyle}
      </style>
      <lion-form id="form" @submit="${submit}">
        <form>
          <lion-select-rich
            id="color"
            name="color"
            label="Favorite color"
            .errorValidators="${[['required']]}"
          >
            <lion-options slot="input" class="demo-listbox">
              <lion-option .choiceValue=${null}>select a color</lion-option>
              <lion-option .choiceValue=${'red'}>Red</lion-option>
              <lion-option .choiceValue=${'hotpink'}>Hotpink</lion-option>
              <lion-option .choiceValue=${'teal'}>Teal</lion-option>
            </lion-options>
          </lion-select-rich>
          <lion-button type="submit">Submit</lion-button>
        </form>
      </lion-form>
    `;
  })
  .add('Render Options', () => {
    const objs = [
      { type: 'mastercard', label: 'Master Card', amount: 12000, active: true },
      { type: 'visacard', label: 'Visa Card', amount: 0, active: false },
    ];
    return html`
      <lion-form>
        <form>
          <lion-select-rich label="Favorite color" name="color">
            <lion-options slot="input">
              ${objs.map(
                obj => html`
                  <lion-option .modelValue=${{ value: obj, checked: false }}
                    >${obj.label}</lion-option
                  >
                `,
              )}
            </lion-options>
          </lion-select-rich>
        </form>
      </lion-form>
    `;
  });
