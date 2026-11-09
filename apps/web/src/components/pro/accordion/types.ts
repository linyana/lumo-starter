import type { ReactNode } from 'react';
import type { SlotClassNames } from '../types';

export type AccordionItem = {
	value: string;
	/** The question. */
	title: ReactNode;
	/** The answer, folded under it. */
	content: ReactNode;
};

export type AccordionSlots = 'root' | 'item' | 'header' | 'trigger' | 'icon' | 'panel';

export type AccordionProps = {
	items: AccordionItem[];
	/** Whether several answers can be open at once. */
	multiple?: boolean;
	/** The open items: one of them unless `multiple`. */
	defaultValue?: string[];
	className?: string;
	classNames?: SlotClassNames<AccordionSlots>;
};
