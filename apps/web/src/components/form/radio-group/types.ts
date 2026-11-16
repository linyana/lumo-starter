import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { RadioGroupRootProps } from './parts';

type RadioGroupRootPicked<Value> = Pick<
	RadioGroupRootProps<Value>,
	'value' | 'defaultValue' | 'disabled' | 'name' | 'required'
> & {
	/** The option picked. `value`/`onChange` bind every control here — see `pro/checkbox`'s type. */
	onChange?: RadioGroupRootProps<Value>['onValueChange'];
};

export type RadioOption<Value extends string = string> = {
	value: Value;
	label: ReactNode;
	/** Merged onto the row this option is drawn in. */
	className?: string;
	disabled?: boolean;
};

export type RadioGroupSlots = 'root' | 'item' | 'indicator' | 'label';

export type RadioGroupProps<Value extends string = string> = RadioGroupRootPicked<Value> & {
	options: RadioOption<Value>[];
	/** Names the group. A `Field` around it is the better place for it when the group is one answer. */
	'aria-label'?: string;
	className?: string;
	classNames?: SlotClassNames<RadioGroupSlots>;
};
