/**
 * @desc Does all the bookkeeping for child form controls and stores those in `.formElements`.
 *
 * It is the fundament for the `Fieldset` and it wraps 'choice groups'
 * (groups wrapping choice elements like radio, checkbox, option that extend ChoiceInputMixin).
 * - `RadioGroup`
 * - `CheckboxGroup`
 * - `Listbox`
 * - `Select`(-rich)
 * - `Combobox`
 *
 * There are two modes:
 * ## Fieldset mode
 * In this case, `.formElements` behaves like an object.
 * In the fieldset mode, many 'regular' child input elements will be wrapped, like:
 *
 * ```html
 * <lion-fieldset name="fieldset">
 *  <lion-input name="x"></lion-input>
 *  <lion-input name="y"></lion-input>
 * </lion-fieldset>
 * ```
 * `x` and `z` will be avaiable under `.modelValue.x` and `.modelValue.y`.
 *
 *
 * ## Choice Group mode
 * In this case, `.formElements` behaves like an array.
 * (currently, CheckboxGroup and RadioGroup still require `.formElements['name[]']` notation,
 * but this will be corrected in a future breaking release).
 * <!-- Suggestion: provide deprecation path by introducing `.formControls`? -->
 *
 * Note: code below is pseudo code and doesn't reflect real elements.
 * ```html
 * <choice-group name="choiceGroup">
 *  <lion-choice></lion-choice>
 *  <lion-choice></lion-choice>
 * </choice-radio-group>
 * ```
 * Children will be available under `.modelValue[0]` and `.modelValue[1]`.
 *
 *
 * ### Sub modes
 * - single select
 * In this case there is a property `.checkedValue` which will be the modelValue of the selected.
 *
 * - multiselect
 * In this case there is a property `.checkedValues` which will be an array of selected
 * modelValues.
 *
 *
 *
 */
export const GroupMixin = superclass =>
  // eslint-disable-next-line no-shadow
  class GroupMixin extends superclass {};
