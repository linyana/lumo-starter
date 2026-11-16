import { Field as BaseField } from '@base-ui/react/field';

/**
 * A control is labelled and validated by the field around it, so this part owns no look: whatever
 * element it renders — Base UI's Input, a native `<textarea>`, a Checkbox — keeps its own.
 */
export const FieldControl = BaseField.Control;
