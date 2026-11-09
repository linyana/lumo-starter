import type { ReactNode } from 'react';
import type { RootProps } from '@/components/ui/slider';
import type { SlotClassNames } from '../types';

type SliderRootProps = Pick<
	RootProps,
	'value' | 'defaultValue' | 'onValueChange' | 'min' | 'max' | 'step' | 'disabled' | 'orientation'
>;

export type SliderSlots = 'root' | 'label' | 'value' | 'control' | 'track' | 'indicator' | 'thumb';

export type SliderProps = SliderRootProps & {
	/** What the number is about. Left out, the number is left out with it. */
	label?: ReactNode;
	className?: string;
	classNames?: SlotClassNames<SliderSlots>;
};
