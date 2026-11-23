import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { ComponentProps } from 'react';
import { arrow } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type TooltipArrowProps = ComponentProps<typeof BaseTooltip.Arrow>;

export function TooltipArrow({ className, ...props }: TooltipArrowProps) {
	return (
		<BaseTooltip.Arrow
			data-slot="tooltip-arrow"
			className={cn(arrow, 'before:bg-primary', className)}
			{...props}
		/>
	);
}
