import type { ReactNode } from 'react';
import type { SlotClassNames } from '../types';

export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';

export type ScrollAreaSlots = 'root' | 'viewport' | 'content' | 'scrollbar';

export type ScrollAreaProps = {
	children: ReactNode;
	/** The height the area runs out of. Without one it never scrolls. */
	height?: number | string;
	orientation?: ScrollAreaOrientation;
	className?: string;
	classNames?: SlotClassNames<ScrollAreaSlots>;
};
