import type { ReactNode } from 'react';
import type { RootProps } from '@/components/ui/checkbox';
import type { SlotClassNames } from '../types';

type CheckboxRootProps = Pick<
	RootProps,
	'checked' | 'defaultChecked' | 'onCheckedChange' | 'disabled' | 'name' | 'required'
>;

export type CheckboxSlots = 'root' | 'box' | 'indicator' | 'label';

export type CheckboxProps = CheckboxRootProps & {
	/** Drawn beside the box, and pressing it presses the box. */
	label?: ReactNode;
	id?: string;
	/** The row the box and its label are laid out in. */
	className?: string;
	classNames?: SlotClassNames<CheckboxSlots>;
};
