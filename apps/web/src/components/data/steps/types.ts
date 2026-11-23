import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { StepsOrientation, StepsSize, StepStatus, StepsVariant } from './parts';

export type StepItem = {
	title: ReactNode;
	description?: ReactNode;
	icon?: ReactNode;
	status?: StepStatus;
	className?: string;
};

export type StepsSlots = 'root' | 'item' | 'title' | 'description';

export type StepsProps = {
	items: StepItem[];
	current?: number;
	orientation?: StepsOrientation;
	size?: StepsSize;
	variant?: StepsVariant;
	className?: string;
	classNames?: SlotClassNames<StepsSlots>;
};
