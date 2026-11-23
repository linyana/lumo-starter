import { Popover as BasePopover } from '@base-ui/react/popover';
import type { ComponentProps } from 'react';
import { description } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type PopoverDescriptionProps = ComponentProps<typeof BasePopover.Description>;

export function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
	return (
		<BasePopover.Description
			data-slot="popover-description"
			className={cn(description, className)}
			{...props}
		/>
	);
}
