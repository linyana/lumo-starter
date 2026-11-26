import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { CardSize, CardSurface } from './parts';

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
	action?: ReactNode;
	footer?: ReactNode;
	children?: ReactNode;
	size?: CardSize;
	surface?: CardSurface;
	hoverable?: boolean;
	className?: string;
	classNames?: SlotClassNames<CardSlots>;
};
