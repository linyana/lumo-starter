import type { ReactNode } from 'react';
import type { RootProps } from '@/components/ui/toggle-group';
import type { SlotClassNames } from '../types';

type ToggleGroupRootProps<Value extends string> = Pick<
	RootProps<Value>,
	'value' | 'defaultValue' | 'onValueChange' | 'multiple' | 'orientation' | 'disabled' | 'loopFocus'
>;

export type ToggleGroupItem<Value extends string = string> = {
	value: Value;
	/** The word on the item. Left out, the icon is the whole of it — give it an `aria-label` then. */
	label?: ReactNode;
	icon?: ReactNode;
	disabled?: boolean;
	/** Merged onto this item after `classNames.item`. */
	className?: string;
	'aria-label'?: string;
};

export type ToggleGroupSlots = 'root' | 'item';

export type ToggleGroupProps<Value extends string = string> = ToggleGroupRootProps<Value> & {
	items: ToggleGroupItem<Value>[];
	/** The tier and the scale, shared by every item of the row. */
	variant?: RootProps<Value>['variant'];
	size?: RootProps<Value>['size'];
	className?: string;
	classNames?: SlotClassNames<ToggleGroupSlots>;
};
