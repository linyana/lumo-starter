import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { SwitchRootProps } from './parts';

/** `value`/`onChange` are the pair every control here is bound by — see `pro/checkbox`'s type. */
type SwitchRootPicked = Pick<SwitchRootProps, 'disabled' | 'name' | 'required'> & {
	value?: boolean;
	defaultValue?: boolean;
	onChange?: (value: boolean) => void;
};

export type SwitchSlots = 'root' | 'track' | 'thumb' | 'label';

export type SwitchProps = SwitchRootPicked & {
	/** Drawn beside the track, and pressing it presses the track. */
	label?: ReactNode;
	id?: string;
	/** The row the track and its label are laid out in. */
	className?: string;
	classNames?: SlotClassNames<SwitchSlots>;
};
