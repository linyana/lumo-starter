import { LumoPopover } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
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
		<LumoPopover.Root>
			<LumoPopover.Trigger render={trigger} />
			<LumoPopover.Portal>
				<LumoPopover.Positioner side={side} align={align}>
					<LumoPopover.Popup className={cn(className, classNames?.popup)}>
						{arrow && <LumoPopover.Arrow className={classNames?.arrow} />}
						{children}
					</LumoPopover.Popup>
				</LumoPopover.Positioner>
			</LumoPopover.Portal>
		</LumoPopover.Root>
	);
};
