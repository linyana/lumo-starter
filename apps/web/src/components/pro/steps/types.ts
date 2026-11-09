import type { ReactNode } from 'react';
import type { StepStatus, StepsOrientation, StepsSize, StepsVariant } from '@/components/ui/steps';
import type { SlotClassNames } from '../types';

export type StepItem = {
	title: ReactNode;
	description?: ReactNode;
	/** A glyph in place of the number. `finish` draws a check on its own. */
	icon?: ReactNode;
	/** Overrides what the current index says about this step. */
	status?: StepStatus;
	/** Merged onto this step after `classNames.item`. */
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
