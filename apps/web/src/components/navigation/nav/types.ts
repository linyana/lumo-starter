import type { ReactElement, ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';

export type NavItemEntry = {
	type?: 'item';
	key: string;
	label: string;
	icon?: ReactNode;
	/** Given it, the row is a link rather than a button. */
	href?: string;
	/**
	 * Draws the row with an element of your own — `render={<NavLink to="/docs" />}`. The nav still
	 * supplies `href`, the active state and the click, so a router keeps its own navigation and its
	 * own active logic; `onSelect` still fires.
	 */
	render?: ReactElement;
	isActive?: boolean;
	/** Disables the row and, for a parent, every destination below it. */
	disabled?: boolean;
	/**
	 * Shown on the row's trailing edge. A row that expanded into children has no trailing edge of
	 * its own, so a badge given here is not drawn.
	 */
	badge?: ReactNode;
	/** Merged onto this row after `classNames.button`. */
	className?: string;
	/** Runs before `onSelect`. A row that goes somewhere usually does not need it. */
	onClick?: () => void;
	/** Sub rows: the row expands in place instead of navigating. */
	children?: NavItemEntry[];
	defaultOpen?: boolean;
};

export type NavGroupEntry = {
	type: 'group';
	label?: string;
	/**
	 * A control of the group's own, such as an add button. Rendered as given, so pass one that
	 * positions itself — `NavGroupEntryAction` already does.
	 */
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
	/** Content pinned inside the same compact navigation context. */
	children?: ReactNode;
	selectedKey?: string;
	onSelect?: (key: string) => void;
	/** The rail: one glyph per row, with the label in a tooltip. */
	compact?: boolean;
	className?: string;
	classNames?: SlotClassNames<NavSlots>;
};
