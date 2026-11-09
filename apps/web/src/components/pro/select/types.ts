import type { ReactNode } from 'react';
import type { TriggerProps } from '@/components/ui/select';
import type { SlotClassNames } from '../types';

export type SelectOption<Value extends string = string> = {
	value: Value;
	label: ReactNode;
	/** Merged onto this row after `classNames.item`. */
	className?: string;
	disabled?: boolean;
};

export type SelectSlots = 'trigger' | 'value' | 'popup' | 'list' | 'item';

export type SelectProps<Value extends string = string> = {
	options: SelectOption<Value>[];
	value?: Value | null;
	defaultValue?: Value | null;
	onValueChange?: (value: Value | null) => void;
	/** Shown in the trigger while no option is chosen. */
	placeholder?: ReactNode;
	size?: TriggerProps['size'];
	disabled?: boolean;
	name?: string;
	id?: string;
	required?: boolean;
	/** The control itself — the shorthand for `classNames.trigger`. */
	className?: string;
	classNames?: SlotClassNames<SelectSlots>;
};
