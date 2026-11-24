import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { SliderRootProps } from './parts';

type SliderRootPicked = Pick<
	SliderRootProps,
	'value' | 'defaultValue' | 'min' | 'max' | 'step' | 'disabled' | 'orientation'
> & {
	onChange?: SliderRootProps['onValueChange'];
};

export type SliderSlots = 'root' | 'label' | 'value' | 'control' | 'track' | 'indicator' | 'thumb';

export type SliderProps = SliderRootPicked & {
	label?: ReactNode;
	loading?: boolean;
	className?: string;
	classNames?: SlotClassNames<SliderSlots>;
};
