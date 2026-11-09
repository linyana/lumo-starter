import type { PositionerProps } from '@/components/ui/popover';
import type { ReactElement, ReactNode } from 'react';

type PopoverPlacement = Pick<PositionerProps, 'side' | 'align'>;

export type PopoverProps = PopoverPlacement & {
	children: ReactNode;
	/** Draws the pointer that ties the popup back to its trigger. */
	arrow?: boolean;
	trigger: ReactElement;
};
