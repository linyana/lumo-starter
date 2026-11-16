import { Popover as BasePopover } from '@base-ui/react/popover';
import type { ComponentProps } from 'react';
import { backdrop } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type PopoverBackdropProps = ComponentProps<typeof BasePopover.Backdrop>;

export function PopoverBackdrop({ className, ...props }: PopoverBackdropProps) {
	return (
		<BasePopover.Backdrop
			data-slot="popover-backdrop"
			className={cn(backdrop, className)}
			{...props}
		/>
	);
}
