import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { CheckboxRootProps } from './parts';

type CheckboxRootPicked = Pick<CheckboxRootProps, 'disabled' | 'name' | 'required'> & {
	value?: boolean;
	defaultValue?: boolean;
	onChange?: (value: boolean) => void;
};

export type CheckboxSlots = 'root' | 'box' | 'indicator' | 'label';

export type CheckboxProps = CheckboxRootPicked & {
	label?: ReactNode;
	id?: string;
	className?: string;
	classNames?: SlotClassNames<CheckboxSlots>;
};
