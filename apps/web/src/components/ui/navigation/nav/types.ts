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
	children?: NavSubEntry[];
	defaultOpen?: boolean;
};

type NavGroupBase = {
	label?: string;
	action?: ReactNode;
};

export type NavGroupEntry = NavGroupBase & {
	type: 'group';
	children: NavEntry[];
};

export type NavSubGroupEntry = NavGroupBase & {
	type: 'group';
	children: NavSubEntry[];
};

export type NavSubEntry = NavItemEntry | NavSubGroupEntry;

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
	| 'subButton'
	| 'subItem'
	| 'subList'
	| 'subGroup'
	| 'subGroupLabel';

export type NavProps = {
	items?: NavEntry[];
	children?: ReactNode;
	selectedKey?: string;
	onSelect?: (key: string) => void;
	compact?: boolean;
	className?: string;
	classNames?: SlotClassNames<NavSlots>;
};
