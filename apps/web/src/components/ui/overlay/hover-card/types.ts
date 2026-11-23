import type { ReactElement, ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { HoverCardPositionerProps } from './parts';

type HoverCardPlacement = Pick<HoverCardPositionerProps, 'side' | 'align'>;

export type HoverCardSlots = 'popup' | 'arrow';

export type HoverCardProps = HoverCardPlacement & {
	content: ReactNode;
	children: ReactElement;
	arrow?: boolean;
	delay?: number;
	className?: string;
	classNames?: SlotClassNames<HoverCardSlots>;
};
