import type {
	NavEntry,
	NavGroupEntry,
	NavItemEntry,
	NavSeparatorEntry,
	NavSkeletonEntry,
} from '@/components';

/** A row's element, when the app wants to own it — a router's link, an `<a>`, a custom tag. */
export type LayoutNavLinkRender = NonNullable<NavItemEntry['render']>;

export type LayoutNavItem = NavItemEntry;

export type LayoutNavGroup = NavGroupEntry;

export type LayoutNavSeparator = NavSeparatorEntry;

/** One placeholder row, for a nav that is still loading. */
export type LayoutNavSkeleton = NavSkeletonEntry;

export type LayoutNavEntry = NavEntry;
