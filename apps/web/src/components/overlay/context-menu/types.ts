import type { MenuEntry, MenuSlots } from '@/components/overlay/menu';
import type { SlotClassNames } from '@/components/types';

/** A spot on the page, in viewport pixels: where the pointer was when it asked for the menu. */
export type ContextMenuPoint = { x: number; y: number };

/**
 * What the menu is placed against: the control that was pressed, or the spot a right press reported.
 * `null` is a menu that is not open — the one state the caller owns.
 */
export type ContextMenuAnchor = ContextMenuPoint | Element | null;

/** What an open menu is: where it was opened, and the list it is showing. */
export type ContextMenuOpen = { anchor: ContextMenuAnchor; items: MenuEntry[] };

export type ContextMenuProps = {
	/** Where it opens, or `null` while it is closed. */
	anchor: ContextMenuAnchor;
	items: MenuEntry[];
	/** Runs when it asks to close: an action was picked, Escape was pressed, or the page was pressed. */
	onClose: () => void;
	/** The list itself — the shorthand for `classNames.popup`. */
	className?: string;
	classNames?: SlotClassNames<MenuSlots>;
};
