import type { ReactNode } from 'react';
import type { RootProps } from '@/components/ui/radio-group';
import type { SlotClassNames } from '../types';

type RadioGroupRootProps<Value> = Pick<
	RootProps<Value>,
	'value' | 'defaultValue' | 'disabled' | 'name' | 'required'
> & {
	/** The option picked. `value`/`onChange` bind every control here — see `pro/checkbox`'s type. */
	onChange?: RootProps<Value>['onValueChange'];
};

export type RadioOption<Value extends string = string> = {
	value: Value;
	label: ReactNode;
	/** Merged onto the row this option is drawn in. */
	className?: string;
	disabled?: boolean;
};

export type RadioGroupSlots = 'root' | 'item' | 'indicator' | 'label';

export type RadioGroupProps<Value extends string = string> = RadioGroupRootProps<Value> & {
	options: RadioOption<Value>[];
	/** Names the group. A `Field` around it is the better place for it when the group is one answer. */
	'aria-label'?: string;
	className?: string;
	classNames?: SlotClassNames<RadioGroupSlots>;
};
