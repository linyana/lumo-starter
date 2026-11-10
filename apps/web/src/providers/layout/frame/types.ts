import type { NavEntry, NavGroup, NavItem, NavSeparator, NavSkeleton } from '@/components';

/** A row's element, when the app wants to own it — a router's link, an `<a>`, a custom tag. */
export type LayoutNavLinkRender = NonNullable<NavItem['render']>;

export type LayoutNavItem = NavItem;

export type LayoutNavGroup = NavGroup;

export type LayoutNavSeparator = NavSeparator;

/** One placeholder row, for a nav that is still loading. */
export type LayoutNavSkeleton = NavSkeleton;

export type LayoutNavEntry = NavEntry;
