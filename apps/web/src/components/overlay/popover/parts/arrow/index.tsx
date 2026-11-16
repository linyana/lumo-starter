import { Popover as BasePopover } from '@base-ui/react/popover';
import type { ComponentProps } from 'react';
import { arrow } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type PopoverArrowProps = ComponentProps<typeof BasePopover.Arrow>;

export function PopoverArrow({ className, ...props }: PopoverArrowProps) {
	return (
		<BasePopover.Arrow
			data-slot="popover-arrow"
			// The point carries the popup's own border and fill, so the outline reads as one shape.
			className={cn(arrow, 'before:border before:border-border before:bg-popover', className)}
			{...props}
		/>
	);
}
