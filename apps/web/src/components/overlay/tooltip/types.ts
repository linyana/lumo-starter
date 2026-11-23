import type { ReactElement, ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { TooltipPositionerProps } from './parts';

type TooltipPlacement = Pick<TooltipPositionerProps, 'side' | 'align'>;

export type TooltipSlots = 'popup' | 'arrow';

export type TooltipProps = TooltipPlacement & {
	content: ReactNode;
	children: ReactElement;
	arrow?: boolean;
	delay?: number;
	disabled?: boolean;
	className?: string;
	classNames?: SlotClassNames<TooltipSlots>;
};
