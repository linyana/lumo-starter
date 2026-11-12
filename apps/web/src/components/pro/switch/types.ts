import type { ReactNode } from 'react';
import type { RootProps } from '@/components/ui/switch';
import type { SlotClassNames } from '../types';

/** `value`/`onChange` are the pair every control here is bound by — see `pro/checkbox`'s type. */
type SwitchRootProps = Pick<RootProps, 'disabled' | 'name' | 'required'> & {
	value?: boolean;
	defaultValue?: boolean;
	onChange?: (value: boolean) => void;
};

export type SwitchSlots = 'root' | 'track' | 'thumb' | 'label';

export type SwitchProps = SwitchRootProps & {
	/** Drawn beside the track, and pressing it presses the track. */
	label?: ReactNode;
	id?: string;
	/** The row the track and its label are laid out in. */
	className?: string;
	classNames?: SlotClassNames<SwitchSlots>;
};
