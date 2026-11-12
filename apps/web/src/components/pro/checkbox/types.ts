import type { ReactNode } from 'react';
import type { RootProps } from '@/components/ui/checkbox';
import type { SlotClassNames } from '../types';

/**
 * The value is a boolean here rather than Base UI's `checked`: every control this library hands to a
 * screen reports and takes its value the same way, as `value` and `onChange`, so a field around it
 * never has to know which kind of control it is holding.
 */
type CheckboxRootProps = Pick<RootProps, 'disabled' | 'name' | 'required'> & {
	value?: boolean;
	defaultValue?: boolean;
	onChange?: (value: boolean) => void;
};

export type CheckboxSlots = 'root' | 'box' | 'indicator' | 'label';

export type CheckboxProps = CheckboxRootProps & {
	/** Drawn beside the box, and pressing it presses the box. */
	label?: ReactNode;
	id?: string;
	/** The row the box and its label are laid out in. */
	className?: string;
	classNames?: SlotClassNames<CheckboxSlots>;
};
