import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { SelectTriggerProps } from './parts';

export type SelectOption<Value = string> = {
	value: Value;
	label: ReactNode;
	className?: string;
	disabled?: boolean;
};

export type SelectSlots = 'group' | 'trigger' | 'clear' | 'value' | 'popup' | 'list' | 'item';

export type SelectProps<Value = string> = {
	options: SelectOption<Value>[];
	value?: Value | null;
	defaultValue?: Value | null;
	onChange?: (value: Value | null) => void;
	ariaLabel?: string;
	placeholder?: ReactNode;
	size?: SelectTriggerProps['size'];
	disabled?: boolean;
	loading?: boolean;
	invalid?: boolean;
	name?: string;
	id?: string;
	required?: boolean;
	clearable?: boolean;
	clearLabel?: string;
	className?: string;
	classNames?: SlotClassNames<SelectSlots>;
};
