import { Popover as BasePopover } from '@base-ui/react/popover';
import type { ComponentProps } from 'react';
import { viewport } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type PopoverViewportProps = ComponentProps<typeof BasePopover.Viewport>;

export function PopoverViewport({ className, ...props }: PopoverViewportProps) {
	return (
		<BasePopover.Viewport
			data-slot="popover-viewport"
			className={cn(viewport, '[--viewport-inline-padding:--spacing(3)] py-3', className)}
			{...props}
		/>
	);
}
