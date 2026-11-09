import type { ReactElement, ReactNode } from 'react';
import type { PositionerProps } from '@/components/ui/tooltip';
import type { SlotClassNames } from '../types';

type TooltipPlacement = Pick<PositionerProps, 'side' | 'align'>;

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
