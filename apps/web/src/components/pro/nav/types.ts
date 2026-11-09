import type { ReactNode } from 'react';
import type { SlotClassNames } from '../types';

export type NavItem = {
	key: string;
	label: string;
	icon?: ReactNode;
	/** Given it, the row is a link rather than a button. */
	href?: string;
	isActive?: boolean;
	disabled?: boolean;
	/** Shown on the row's trailing edge. */
	badge?: ReactNode;
	/** Merged onto this row after `classNames.button`. */
	className?: string;
	onClick?: () => void;
};

export type NavSlots = 'root' | 'list' | 'item' | 'button' | 'badge';

export type NavProps = {
	items: NavItem[];
	/** The rail: one glyph per row, with the label in a tooltip. */
	compact?: boolean;
	className?: string;
	classNames?: SlotClassNames<NavSlots>;
};
