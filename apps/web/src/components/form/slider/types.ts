import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { SliderRootProps } from './parts';

type SliderRootPicked = Pick<
	SliderRootProps,
	'value' | 'defaultValue' | 'min' | 'max' | 'step' | 'disabled' | 'orientation'
> & {
	/** The number the knob stopped on. `value`/`onChange` bind every control here — see `pro/checkbox`'s type. */
	onChange?: SliderRootProps['onValueChange'];
};

export type SliderSlots = 'root' | 'label' | 'value' | 'control' | 'track' | 'indicator' | 'thumb';

export type SliderProps = SliderRootPicked & {
	/** What the number is about. Left out, the number is left out with it. */
	label?: ReactNode;
	className?: string;
	classNames?: SlotClassNames<SliderSlots>;
};
