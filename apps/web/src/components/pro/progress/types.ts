import type { ReactNode } from 'react';
import type { SlotClassNames } from '../types';

export type ProgressSlots = 'root' | 'label' | 'value' | 'track' | 'indicator';

export type ProgressProps = {
	/** `null` while the work is happening and how much of it is left is not known. */
	value: number | null;
	max?: number;
	/** Named above the bar, with the number on the same line. */
	label?: ReactNode;
	className?: string;
	classNames?: SlotClassNames<ProgressSlots>;
};
