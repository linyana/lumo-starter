import type { ReactElement, ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { PopoverPositionerProps } from './parts';

type PopoverPlacement = Pick<PopoverPositionerProps, 'side' | 'align'>;

export type PopoverSlots = 'popup' | 'arrow';

export type PopoverProps = PopoverPlacement & {
	children: ReactNode;
	arrow?: boolean;
	trigger: ReactElement;
	className?: string;
	classNames?: SlotClassNames<PopoverSlots>;
};
