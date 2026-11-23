import type { ReactElement, ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';

export type NavItemEntry = {
	type?: 'item';
	key: string;
	label: string;
	icon?: ReactNode;
	href?: string;
	render?: ReactElement;
	isActive?: boolean;
	disabled?: boolean;
	badge?: ReactNode;
	className?: string;
	onClick?: () => void;
	children?: NavItemEntry[];
	defaultOpen?: boolean;
};

export type NavGroupEntry = {
	type: 'group';
	label?: string;
	action?: ReactNode;
	children: NavEntry[];
};

export type NavSeparatorEntry = { type: 'separator' };
export type NavSkeletonEntry = { type: 'skeleton'; showIcon?: boolean; width?: string };
export type NavEntry = NavItemEntry | NavGroupEntry | NavSeparatorEntry | NavSkeletonEntry;

export type NavSlots =
	| 'root'
	| 'list'
	| 'item'
	| 'button'
	| 'badge'
	| 'group'
	| 'groupLabel'
	| 'subButton';

export type NavProps = {
	items?: NavEntry[];
	children?: ReactNode;
	selectedKey?: string;
	onSelect?: (key: string) => void;
	compact?: boolean;
	className?: string;
	classNames?: SlotClassNames<NavSlots>;
};
