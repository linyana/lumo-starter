import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { ToggleGroupRootProps } from './parts';

type ToggleGroupRootPicked<Value extends string> = Pick<
	ToggleGroupRootProps<Value>,
	'value' | 'defaultValue' | 'multiple' | 'orientation' | 'disabled' | 'loopFocus'
> & {
	onChange?: ToggleGroupRootProps<Value>['onValueChange'];
};

export type ToggleGroupItem<Value extends string = string> = {
	value: Value;
	label?: ReactNode;
	icon?: ReactNode;
	disabled?: boolean;
	className?: string;
	'aria-label'?: string;
};

export type ToggleGroupSlots = 'root' | 'item';

export type ToggleGroupProps<Value extends string = string> = ToggleGroupRootPicked<Value> & {
	items: ToggleGroupItem<Value>[];
	variant?: ToggleGroupRootProps<Value>['variant'];
	size?: ToggleGroupRootProps<Value>['size'];
	loading?: boolean;
	className?: string;
	classNames?: SlotClassNames<ToggleGroupSlots>;
};
