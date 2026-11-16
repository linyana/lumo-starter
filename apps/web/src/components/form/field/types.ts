import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { FieldRootProps } from './parts';

type FieldRootPicked = Pick<FieldRootProps, 'name' | 'disabled' | 'validate' | 'validationMode'>;

export type FieldSlots = 'root' | 'label' | 'description' | 'error';

export type FieldProps = FieldRootPicked & {
	label?: ReactNode;
	/** The line under the control, in place of `error` while the field is valid. */
	description?: ReactNode;
	/** Shown by the control's own verdict; a form's verdict for this name wins over it. */
	error?: ReactNode;
	/** The control: an `Input`, a `Select`, a `Checkbox`. */
	children: ReactNode;
	className?: string;
	classNames?: SlotClassNames<FieldSlots>;
};
