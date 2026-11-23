import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';

export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';

export type ScrollAreaSlots = 'root' | 'viewport' | 'content' | 'scrollbar';

export type ScrollAreaProps = {
	children: ReactNode;
	height?: number | string;
	orientation?: ScrollAreaOrientation;
	className?: string;
	classNames?: SlotClassNames<ScrollAreaSlots>;
};
