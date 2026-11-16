import { cn } from '@/lib/utils';
import {
	PopoverArrow,
	PopoverPopup,
	PopoverPortal,
	PopoverPositioner,
	PopoverRoot,
	PopoverTrigger,
} from './parts';
import type { PopoverProps } from './types';

export const Popover = ({
	children,
	trigger,
	side = 'bottom',
	align = 'start',
	arrow = true,
	className,
	classNames,
}: PopoverProps) => {
	return (
		<PopoverRoot>
			<PopoverTrigger render={trigger} />
			<PopoverPortal>
				<PopoverPositioner side={side} align={align}>
					<PopoverPopup className={cn(className, classNames?.popup)}>
						{arrow && <PopoverArrow className={classNames?.arrow} />}
						{children}
					</PopoverPopup>
				</PopoverPositioner>
			</PopoverPortal>
		</PopoverRoot>
	);
};
