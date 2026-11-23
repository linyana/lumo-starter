import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';

export type ProgressSlots = 'root' | 'label' | 'value' | 'track' | 'indicator';

export type ProgressProps = {
	value: number | null;
	max?: number;
	label?: ReactNode;
	className?: string;
	classNames?: SlotClassNames<ProgressSlots>;
};
