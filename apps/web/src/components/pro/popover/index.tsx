import { LumoButton } from '../../ui/button';
import { LumoPopover } from '../../ui/popover';

export const Popover = () => {
	return (
		<LumoPopover.Root>
			<LumoPopover.Trigger render={<LumoButton>open</LumoButton>} />
			<LumoPopover.Portal>
				<LumoPopover.Positioner side="bottom" align="start">
					<LumoPopover.Popup>
						<LumoPopover.Arrow />
						<LumoPopover.Title>deploy to production?</LumoPopover.Title>
						<LumoPopover.Description>it rebuilds in about a minute.</LumoPopover.Description>
						<LumoPopover.Close render={<LumoButton size="sm">deploy</LumoButton>} />
					</LumoPopover.Popup>
				</LumoPopover.Positioner>
			</LumoPopover.Portal>
		</LumoPopover.Root>
	);
};
