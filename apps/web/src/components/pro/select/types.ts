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

export type SelectSlots = 'group' | 'trigger' | 'clear' | 'value' | 'popup' | 'list' | 'item';

export type SelectProps<Value extends string = string> = {
	options: SelectOption<Value>[];
	value?: Value | null;
	defaultValue?: Value | null;
	/** The value picked — `null` when the way back was taken. */
	onChange?: (value: Value | null) => void;
	/** Shown in the trigger while no option is chosen. */
	placeholder?: ReactNode;
	size?: TriggerProps['size'];
	disabled?: boolean;
	name?: string;
	id?: string;
	required?: boolean;
	/**
	 * Whether a chosen value can be given back. On by default — and never offered while the select is
	 * `required` or `disabled`, because there is no way back from a field that must be answered.
	 */
	clearable?: boolean;
	/** The words the clear button is labelled with, for a reader who cannot see the cross. */
	clearLabel?: string;
	/** The box the field and its way out share — the shorthand for `classNames.group`. */
	className?: string;
	classNames?: SlotClassNames<SelectSlots>;
};
