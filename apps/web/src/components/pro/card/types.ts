import type { ReactNode } from 'react';
import type { CardSize } from '@/components/ui/card';
import type { SlotClassNames } from '../types';

export type CardSlots =
	| 'root'
	| 'header'
	| 'title'
	| 'description'
	| 'action'
	| 'content'
	| 'footer';

export type CardProps = {
	title?: ReactNode;
	description?: ReactNode;
	/** The corner of the header: one button, one menu trigger. */
	action?: ReactNode;
	footer?: ReactNode;
	children?: ReactNode;
	size?: CardSize;
	bordered?: boolean;
	/** Lights the whole tile under the pointer — the card is still the consumer's to make clickable. */
	hoverable?: boolean;
	className?: string;
	/** The parts around `className`, which is the surface itself. */
	classNames?: SlotClassNames<CardSlots>;
};
