import { Popover as BasePopover } from '@base-ui/react/popover';
import type { ComponentProps } from 'react';
import { positioner } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type PopoverPositionerProps = ComponentProps<typeof BasePopover.Positioner>;

export function PopoverPositioner({ className, sideOffset = 8, ...props }: PopoverPositionerProps) {
	return (
		<BasePopover.Positioner
			data-slot="popover-positioner"
			sideOffset={sideOffset}
			className={cn('z-50', positioner, className)}
			{...props}
		/>
	);
}
