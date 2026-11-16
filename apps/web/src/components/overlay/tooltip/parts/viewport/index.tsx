import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { ComponentProps } from 'react';
import { viewport } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type TooltipViewportProps = ComponentProps<typeof BaseTooltip.Viewport>;

export function TooltipViewport({ className, ...props }: TooltipViewportProps) {
	return (
		<BaseTooltip.Viewport
			data-slot="tooltip-viewport"
			className={cn(viewport, '[--viewport-inline-padding:--spacing(2.5)] py-1', className)}
			{...props}
		/>
	);
}
