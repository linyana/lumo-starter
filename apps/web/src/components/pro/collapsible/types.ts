import type { ReactNode } from 'react';
import type { SlotClassNames } from '../types';

export type CollapsibleSlots = 'trigger' | 'icon' | 'panel';

export type CollapsibleProps = {
	/** The question the panel answers. */
	title: ReactNode;
	children: ReactNode;
	defaultOpen?: boolean;
	disabled?: boolean;
	/** The collapsed root draws no element, so the shorthand is the row that is pressed. */
	className?: string;
	classNames?: SlotClassNames<CollapsibleSlots>;
};
