import type { ReactElement, ReactNode } from 'react';
import type { PositionerProps } from '@/components/ui/hover-card';
import type { SlotClassNames } from '../types';

type HoverCardPlacement = Pick<PositionerProps, 'side' | 'align'>;

export type HoverCardSlots = 'popup' | 'arrow';

export type HoverCardProps = HoverCardPlacement & {
	/** Read, not used: the card is a preview of the thing its trigger names. */
	content: ReactNode;
	children: ReactElement;
	arrow?: boolean;
	/** How long the pointer rests before the card arrives. */
	delay?: number;
	/** The card itself — the shorthand for `classNames.popup`. */
	className?: string;
	classNames?: SlotClassNames<HoverCardSlots>;
};
