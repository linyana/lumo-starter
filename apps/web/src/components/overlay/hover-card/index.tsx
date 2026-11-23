import { cn } from '@/lib/utils';
import {
	HoverCardArrow,
	HoverCardPopup,
	HoverCardPortal,
	HoverCardPositioner,
	HoverCardRoot,
	HoverCardTrigger,
} from './parts';
import type { HoverCardProps } from './types';

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
	<HoverCardRoot>
		<HoverCardTrigger render={children} delay={delay} />
		<HoverCardPortal>
			<HoverCardPositioner side={side} align={align}>
				<HoverCardPopup className={cn(className, classNames?.popup)}>
					{content}
					{arrow && <HoverCardArrow className={classNames?.arrow} />}
				</HoverCardPopup>
			</HoverCardPositioner>
		</HoverCardPortal>
	</HoverCardRoot>
);
