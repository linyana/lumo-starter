import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { PageWidth } from '@/components/page';

export type PageSlots =
	| 'root'
	| 'header'
	| 'heading'
	| 'breadcrumb'
	| 'title'
	| 'description'
	| 'actions';

export type PageProps = {
	width?: PageWidth;
	breadcrumb?: ReactNode;
	title?: ReactNode;
	description?: ReactNode;
	actions?: ReactNode;
	children?: ReactNode;
	className?: string;
	classNames?: SlotClassNames<PageSlots>;
};
