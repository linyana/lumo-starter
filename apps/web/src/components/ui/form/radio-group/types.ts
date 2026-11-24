import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { RadioGroupRootProps } from './parts';

type RadioGroupRootPicked<Value> = Pick<
	RadioGroupRootProps<Value>,
	'value' | 'defaultValue' | 'disabled' | 'name' | 'required'
> & {
	onChange?: RadioGroupRootProps<Value>['onValueChange'];
	loading?: boolean;
};

export type RadioOption<Value extends string = string> = {
	value: Value;
	label: ReactNode;
	className?: string;
	disabled?: boolean;
};

export type RadioGroupSlots = 'root' | 'item' | 'indicator' | 'label';

export type RadioGroupProps<Value extends string = string> = RadioGroupRootPicked<Value> & {
	options: RadioOption<Value>[];
	'aria-label'?: string;
	className?: string;
	classNames?: SlotClassNames<RadioGroupSlots>;
};
