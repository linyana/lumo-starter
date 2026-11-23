import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { SwitchRootProps } from './parts';

type SwitchRootPicked = Pick<SwitchRootProps, 'disabled' | 'name' | 'required'> & {
	value?: boolean;
	defaultValue?: boolean;
	onChange?: (value: boolean) => void;
};

export type SwitchSlots = 'root' | 'track' | 'thumb' | 'label';

export type SwitchProps = SwitchRootPicked & {
	label?: ReactNode;
	id?: string;
	className?: string;
	classNames?: SlotClassNames<SwitchSlots>;
};
