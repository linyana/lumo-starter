import type {
	NavEntry,
	NavGroupEntry,
	NavItemEntry,
	NavSeparatorEntry,
	NavSkeletonEntry,
} from '@/components';

export type LayoutNavLinkRender = NonNullable<NavItemEntry['render']>;

export type LayoutNavItem = NavItemEntry;

export type LayoutNavGroup = NavGroupEntry;

export type LayoutNavSeparator = NavSeparatorEntry;

export type LayoutNavSkeleton = NavSkeletonEntry;

export type LayoutNavEntry = NavEntry;
