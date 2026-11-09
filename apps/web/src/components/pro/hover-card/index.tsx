import { LumoHoverCard } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import type { HoverCardProps } from './types';

/** A card that arrives when a pointer rests on the thing it is about, and stays while it is inside. */
export const HoverCard = ({
	content,
	children,
	side = 'bottom',
	align = 'start',
	arrow = false,
	delay = 200,
	className,
	classNames,
}: HoverCardProps) => (
	<LumoHoverCard.Root>
		<LumoHoverCard.Trigger render={children} delay={delay} />
		<LumoHoverCard.Portal>
			<LumoHoverCard.Positioner side={side} align={align}>
				<LumoHoverCard.Popup className={cn(className, classNames?.popup)}>
					{content}
					{arrow && <LumoHoverCard.Arrow className={classNames?.arrow} />}
				</LumoHoverCard.Popup>
			</LumoHoverCard.Positioner>
		</LumoHoverCard.Portal>
	</LumoHoverCard.Root>
);
