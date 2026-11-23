import type { MenuEntry, MenuSlots } from '@/components/ui/overlay/menu';
import type { SlotClassNames } from '@/components/types';

export type ContextMenuPoint = { x: number; y: number };

export type ContextMenuAnchor = ContextMenuPoint | Element | null;

export type ContextMenuOpen = { anchor: ContextMenuAnchor; items: MenuEntry[] };

export type ContextMenuProps = {
	anchor: ContextMenuAnchor;
	items: MenuEntry[];
	onClose: () => void;
	className?: string;
	classNames?: SlotClassNames<MenuSlots>;
};
