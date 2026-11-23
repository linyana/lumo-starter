import { useEffect, useRef } from 'react';
import { MenuItems } from '@/components/overlay/menu';
import {
	MenuPopup,
	MenuPortal,
	MenuPositioner,
	MenuRoot,
	MenuViewport,
} from '@/components/overlay/menu/parts';
import { cn } from '@/lib/utils';
import type {
	ContextMenuAnchor,
	ContextMenuOpen,
	ContextMenuPoint,
	ContextMenuProps,
} from './types';

export type {
	ContextMenuAnchor,
	ContextMenuPoint,
	ContextMenuProps,
} from '@/components/overlay/context-menu/types';

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

const isPoint = (anchor: ContextMenuAnchor): anchor is ContextMenuPoint =>
	anchor !== null && 'x' in anchor;

const pressesAnchor = ({
	anchor,
	event,
}: {
	anchor: ContextMenuAnchor;
	event: Event | undefined;
}): boolean => {
	if (anchor === null || event === undefined || isPoint(anchor)) return false;

	return event.target instanceof Node && anchor.contains(event.target);
};

const anchorOf = (anchor: ContextMenuAnchor) => (isPoint(anchor) ? at(anchor) : anchor);

export const ContextMenu = ({
	anchor,
	items,
	onClose,
	className,
	classNames,
}: ContextMenuProps) => {
	const leaving = useRef<ContextMenuOpen | null>(null);

	useEffect(() => {
		if (anchor !== null) leaving.current = { anchor, items };
	});

	const shown = anchor === null ? leaving.current : { anchor, items };

	return (
		<MenuRoot
			open={anchor !== null}
			modal={false}
			onOpenChange={(open, details) => {
				if (open) return;
				if (details.reason === 'outside-press' && pressesAnchor({ anchor, event: details.event })) {
					return;
				}

				onClose();
			}}
		>
			<MenuPortal>
				<MenuPositioner
					anchor={anchorOf(shown?.anchor ?? null)}
					side="bottom"
					align="start"
					sideOffset={4}
				>
					<MenuPopup className={cn('min-w-40', className, classNames?.popup)}>
						<MenuViewport className={classNames?.viewport}>
							<MenuItems items={shown?.items ?? []} classNames={classNames} />
						</MenuViewport>
					</MenuPopup>
				</MenuPositioner>
			</MenuPortal>
		</MenuRoot>
	);
};
