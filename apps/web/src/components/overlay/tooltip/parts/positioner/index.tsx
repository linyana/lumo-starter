import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { ComponentProps } from 'react';
import { positioner } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type TooltipPositionerProps = ComponentProps<typeof BaseTooltip.Positioner>;

export function TooltipPositioner({
	className,
	sideOffset = 11,
	...props
}: TooltipPositionerProps) {
	return (
		<BaseTooltip.Positioner
			data-slot="tooltip-positioner"
			sideOffset={sideOffset}
			// Above every popup: a tooltip explains something that is already inside one.
			className={cn('z-60', positioner, className)}
			{...props}
		/>
	);
}
