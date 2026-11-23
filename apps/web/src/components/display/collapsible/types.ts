import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';

export type CollapsibleSlots = 'trigger' | 'icon' | 'panel';

export type CollapsibleProps = {
	title: ReactNode;
	children: ReactNode;
	defaultOpen?: boolean;
	disabled?: boolean;
	className?: string;
	classNames?: SlotClassNames<CollapsibleSlots>;
};
