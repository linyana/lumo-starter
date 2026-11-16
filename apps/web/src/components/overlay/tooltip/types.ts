import type { ReactElement, ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { TooltipPositionerProps } from './parts';

type TooltipPlacement = Pick<TooltipPositionerProps, 'side' | 'align'>;

export type TooltipSlots = 'popup' | 'arrow';

export type TooltipProps = TooltipPlacement & {
	content: ReactNode;
	/** The element the hint belongs to. It becomes the tooltip's trigger. */
	children: ReactElement;
	/** Draws the pointer that ties the popup back to its trigger. */
	arrow?: boolean;
	/** How long the pointer rests before the hint arrives. */
	delay?: number;
	/** The hint's own box — the shorthand for `classNames.popup`. */
	className?: string;
	classNames?: SlotClassNames<TooltipSlots>;
};
