import { LumoTooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { TooltipProps } from './types';

/** Hover and focus hint anchored to its trigger. */
export const Tooltip = ({
	content,
	children,
	side = 'top',
	align = 'center',
	arrow = false,
	delay = 100,
	className,
	classNames,
}: TooltipProps) => (
	<LumoTooltip.Root>
		<LumoTooltip.Trigger render={children} delay={delay} />
		<LumoTooltip.Portal>
			<LumoTooltip.Positioner side={side} align={align}>
				<LumoTooltip.Popup className={cn(className, classNames?.popup)}>
					{content}
					{arrow && <LumoTooltip.Arrow className={classNames?.arrow} />}
				</LumoTooltip.Popup>
			</LumoTooltip.Positioner>
		</LumoTooltip.Portal>
	</LumoTooltip.Root>
);
