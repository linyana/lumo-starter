import type { ReactElement, ReactNode } from 'react';
import type { PositionerProps } from '@/components/ui/menu';
import type { SlotClassNames } from '../types';

type MenuPlacement = Pick<PositionerProps, 'side' | 'align'>;

export type MenuSlots = 'popup' | 'viewport' | 'item' | 'separator';

export type MenuItem = {
	/** Puts the row under a separator, so a group of actions reads as one. */
	separatorBefore?: boolean;
} & ({
	type: 'content';
	content: ReactNode;
} | {
	type?: 'action';
	label: ReactNode;
	icon?: ReactNode;
	disabled?: boolean;
	/** Drawn in the destructive colour. */
	destructive?: boolean;
	/** Whether selecting the action closes the menu. Defaults to true. */
	closeOnClick?: boolean;
	/** Merged onto this row after `classNames.item`. */
	className?: string;
	onClick?: () => void;
});

export type MenuProps = MenuPlacement & {
	/** The element that opens it. It becomes the menu's trigger. */
	trigger: ReactElement;
	items: MenuItem[];
	/** The list itself — the shorthand for `classNames.popup`. */
	className?: string;
	classNames?: SlotClassNames<MenuSlots>;
};
