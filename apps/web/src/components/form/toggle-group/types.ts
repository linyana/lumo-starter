import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { ToggleGroupRootProps } from './parts';

type ToggleGroupRootPicked<Value extends string> = Pick<
	ToggleGroupRootProps<Value>,
	'value' | 'defaultValue' | 'multiple' | 'orientation' | 'disabled' | 'loopFocus'
> & {
	/**
	 * The value picked: one, several with `multiple`, or `null` when the last one was turned off.
	 * `value`/`onChange` bind every control here — see `pro/checkbox`'s type.
	 */
	onChange?: ToggleGroupRootProps<Value>['onValueChange'];
};

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

export type ToggleGroupProps<Value extends string = string> = ToggleGroupRootPicked<Value> & {
	items: ToggleGroupItem<Value>[];
	/** The tier and the scale, shared by every item of the row. */
	variant?: ToggleGroupRootProps<Value>['variant'];
	size?: ToggleGroupRootProps<Value>['size'];
	className?: string;
	classNames?: SlotClassNames<ToggleGroupSlots>;
};
