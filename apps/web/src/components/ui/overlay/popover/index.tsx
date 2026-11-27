import { cn } from '@/lib/utils';
import {
	PopoverArrow,
	PopoverPopup,
	PopoverPortal,
	PopoverPositioner,
	PopoverRoot,
	PopoverTrigger,
} from './parts';
import type { PopoverAnchor, PopoverPoint, PopoverProps } from './types';

export type {
	PopoverAnchor,
	PopoverPoint,
	PopoverProps,
} from '@/components/ui/overlay/popover/types';

const at = (point: PopoverPoint) => ({
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

const isPoint = (anchor: PopoverAnchor): anchor is PopoverPoint => anchor !== null && 'x' in anchor;

export const Popover = ({
	children,
	trigger,
	anchor = null,
	side = 'bottom',
	align = 'start',
	sideOffset,
	arrow = true,
	className,
	classNames,
}: PopoverProps) => (
	<PopoverRoot>
		<PopoverTrigger render={trigger} />
		<PopoverPortal>
			<PopoverPositioner
				anchor={anchor === null ? undefined : isPoint(anchor) ? at(anchor) : anchor}
				side={side}
				align={align}
				{...(sideOffset === undefined ? {} : { sideOffset })}
			>
				<PopoverPopup className={cn(className, classNames?.popup)}>
					{arrow && <PopoverArrow className={classNames?.arrow} />}
					{children}
				</PopoverPopup>
			</PopoverPositioner>
		</PopoverPortal>
	</PopoverRoot>
);
