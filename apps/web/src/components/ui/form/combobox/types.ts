import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { ComboboxInputProps } from './parts';

export type ComboboxSlots = 'group' | 'input' | 'popup' | 'list' | 'item' | 'empty';

export type ComboboxProps = {
	items: string[];
	value?: string | null;
	defaultValue?: string | null;
	onChange?: (value: string | null) => void;
	placeholder?: string;
	size?: ComboboxInputProps['size'];
	disabled?: boolean;
	loading?: boolean;
	name?: string;
	empty?: ReactNode;
	className?: string;
	classNames?: SlotClassNames<ComboboxSlots>;
};
