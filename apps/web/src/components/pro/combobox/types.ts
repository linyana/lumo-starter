import type { ReactNode } from 'react';
import type { InputProps } from '@/components/ui/combobox';
import type { SlotClassNames } from '../types';

export type ComboboxSlots = 'group' | 'input' | 'popup' | 'list' | 'item' | 'empty';

export type ComboboxProps = {
	/** The options, found by typing. Each is its own label and its own value. */
	items: string[];
	value?: string | null;
	defaultValue?: string | null;
	onValueChange?: (value: string | null) => void;
	placeholder?: string;
	size?: InputProps['size'];
	disabled?: boolean;
	name?: string;
	/** What the list says when the query matches nothing. */
	empty?: ReactNode;
	/** The box the field and its buttons share — the shorthand for `classNames.group`. */
	className?: string;
	classNames?: SlotClassNames<ComboboxSlots>;
};
