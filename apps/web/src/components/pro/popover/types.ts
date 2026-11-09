import type { PositionerProps } from '@/components/ui/popover';
import type { ReactElement, ReactNode } from 'react';
import type { SlotClassNames } from '../types';

type PopoverPlacement = Pick<PositionerProps, 'side' | 'align'>;

export type PopoverSlots = 'popup' | 'arrow';

export type PopoverProps = PopoverPlacement & {
	children: ReactNode;
	/** Draws the pointer that ties the popup back to its trigger. */
	arrow?: boolean;
	trigger: ReactElement;
	/** The panel itself — the shorthand for `classNames.popup`. */
	className?: string;
	classNames?: SlotClassNames<PopoverSlots>;
};
