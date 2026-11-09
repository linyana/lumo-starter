import type { ReactElement, ReactNode } from 'react';

/** A row's element, when the app wants to own it — a router's link, an `<a>`, a custom tag. */
export type LayoutNavLinkRender = ReactElement;

export type LayoutNavItem = {
	type?: 'item';
	key: string;
	label: string;
	icon?: ReactNode;
	/** A count or a state on the row's trailing edge. */
	badge?: ReactNode;
	/** Disables the row and, for a parent, every destination below it. */
	disabled?: boolean;
	/** A row that goes somewhere: the shell draws a link and lets `onSelect` report it. */
	href?: string;
	/**
	 * Draws the row as a link with an element of your own — `render={<NavLink to="/docs" />}`. The
	 * shell supplies `href`, the active state and the click, so a router keeps its own navigation
	 * and its own active logic; `onSelect` still fires.
	 */
	render?: LayoutNavLinkRender;
	/** Marks the row as current regardless of `selectedKey`. */
	isActive?: boolean;
	/** Runs before `onSelect`. A row that goes somewhere usually does not need it. */
	onClick?: () => void;
	/** Sub rows: the row expands in place instead of navigating. */
	children?: LayoutNavItem[];
	defaultOpen?: boolean;
};

export type LayoutNavGroup = {
	type: 'group';
	label?: string;
	/**
	 * A control of the group's own, such as an add button. Rendered as given, so pass one that
	 * positions itself — `LumoNav.GroupAction` already does.
	 */
	action?: ReactNode;
	children: LayoutNavEntry[];
};

export type LayoutNavSeparator = { type: 'separator' };

/** One placeholder row, for a nav that is still loading. */
export type LayoutNavSkeleton = { type: 'skeleton'; showIcon?: boolean; width?: string };

export type LayoutNavEntry =
	| LayoutNavItem
	| LayoutNavGroup
	| LayoutNavSeparator
	| LayoutNavSkeleton;
