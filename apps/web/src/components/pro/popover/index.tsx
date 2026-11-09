import { LumoPopover } from '../../ui/popover';
import type { PopoverProps } from './types';

export const Popover = ({
	children,
	trigger,
	side = 'bottom',
	align = 'start',
	arrow = true,
}: PopoverProps) => {
	return (
		<LumoPopover.Root>
			<LumoPopover.Trigger render={trigger} />
			<LumoPopover.Portal>
				<LumoPopover.Positioner side={side} align={align}>
					<LumoPopover.Popup>
						{arrow && <LumoPopover.Arrow />}
						{children}
					</LumoPopover.Popup>
				</LumoPopover.Positioner>
			</LumoPopover.Portal>
		</LumoPopover.Root>
	);
};
