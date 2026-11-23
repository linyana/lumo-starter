import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';

export type AccordionItem = {
	value: string;
	title: ReactNode;
	content: ReactNode;
};

export type AccordionSlots = 'root' | 'item' | 'header' | 'trigger' | 'icon' | 'panel';

export type AccordionProps = {
	items: AccordionItem[];
	multiple?: boolean;
	defaultValue?: string[];
	className?: string;
	classNames?: SlotClassNames<AccordionSlots>;
};
