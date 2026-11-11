import { useEffect, useRef } from 'react';
import { LumoMenu } from '@/components/ui/menu';
import { cn } from '@/lib/utils';
import { MenuItems } from '../menu';
import type {
	ContextMenuAnchor,
	ContextMenuOpen,
	ContextMenuPoint,
	ContextMenuProps,
} from './types';

export type { ContextMenuAnchor, ContextMenuPoint, ContextMenuProps } from './types';

/**
 * A point as the floating layer reads an anchor: an element of no size, exactly there. The width and
 * height are zero rather than a guess, so the popup is placed against the pointer and not against a
 * box it invented around it.
 */
const at = (point: ContextMenuPoint) => ({
	getBoundingClientRect: () => ({
		x: point.x,
		y: point.y,
		top: point.y,
		left: point.x,
		right: point.x,
		bottom: point.y,
		width: 0,
		height: 0,
	}),
});

/** A point is told from an element by the one thing only it has: a coordinate. */
const isPoint = (anchor: ContextMenuAnchor): anchor is ContextMenuPoint =>
	anchor !== null && 'x' in anchor;

const anchorOf = (anchor: ContextMenuAnchor) => (isPoint(anchor) ? at(anchor) : anchor);

/**
 * The same menu, opened where it is needed instead of behind a trigger: a right press on a record, or
 * the "..." a row keeps once the pointer is on it. Both hand over a place — a pointer's spot or the
 * control that was pressed — and both hold the same list, so the two openings cannot drift apart.
 *
 * The caller owns whether it is open, because the caller is the one that knows which record it is
 * about; what the menu does once it is open — the roving highlight, the typeahead, the Escape that
 * closes it — is Base UI's.
 */
export const ContextMenu = ({
	anchor,
	items,
	onClose,
	className,
	classNames,
}: ContextMenuProps) => {
	// The last list that was open, and where. A closed menu keeps them while it leaves: the popup
	// animates its own height on the way out, so handing it an empty list would collapse it into a
	// white bar instead of shrinking the menu it was showing.
	const leaving = useRef<ContextMenuOpen | null>(null);

	useEffect(() => {
		if (anchor !== null) leaving.current = { anchor, items };
	});

	const shown = anchor === null ? leaving.current : { anchor, items };

	return (
		<LumoMenu.Root
			open={anchor !== null}
			// A menu at the pointer is the page's while it is open, not its prisoner: a right press on
			// another record closes this one and opens that one, in one motion.
			modal={false}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<LumoMenu.Portal>
				<LumoMenu.Positioner
					anchor={anchorOf(shown?.anchor ?? null)}
					side="bottom"
					align="start"
					sideOffset={4}
				>
					<LumoMenu.Popup className={cn('min-w-40', className, classNames?.popup)}>
						<LumoMenu.Viewport className={classNames?.viewport}>
							<MenuItems items={shown?.items ?? []} classNames={classNames} />
						</LumoMenu.Viewport>
					</LumoMenu.Popup>
				</LumoMenu.Positioner>
			</LumoMenu.Portal>
		</LumoMenu.Root>
	);
};
