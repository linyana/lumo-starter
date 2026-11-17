import { cn } from '@/lib/utils';
import {
	TooltipArrow,
	TooltipPopup,
	TooltipPortal,
	TooltipPositioner,
	TooltipRoot,
	TooltipTrigger,
} from './parts';
import type { TooltipProps } from './types';

/** Hover and focus hint anchored to its trigger. */
export const Tooltip = ({
	content,
	children,
	side = 'top',
	align = 'center',
	arrow = false,
	delay = 100,
	disabled = false,
	className,
	classNames,
}: TooltipProps) => (
	<TooltipRoot disabled={disabled}>
		<TooltipTrigger render={children} delay={delay} />
		<TooltipPortal>
			<TooltipPositioner side={side} align={align}>
				<TooltipPopup className={cn(className, classNames?.popup)}>
					{content}
					{arrow && <TooltipArrow className={classNames?.arrow} />}
				</TooltipPopup>
			</TooltipPositioner>
		</TooltipPortal>
	</TooltipRoot>
);
