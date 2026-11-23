import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { FieldRootProps } from './parts';

type FieldRootPicked = Pick<FieldRootProps, 'name' | 'disabled' | 'validate' | 'validationMode'>;

export type FieldSlots = 'root' | 'label' | 'description' | 'error';

export type FieldProps = FieldRootPicked & {
	label?: ReactNode;
	required?: boolean;
	description?: ReactNode;
	error?: ReactNode;
	children: ReactNode;
	className?: string;
	classNames?: SlotClassNames<FieldSlots>;
};
