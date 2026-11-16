import { Popover as BasePopover } from '@base-ui/react/popover';
import type { ComponentProps } from 'react';
import { title } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type PopoverTitleProps = ComponentProps<typeof BasePopover.Title>;

export function PopoverTitle({ className, ...props }: PopoverTitleProps) {
	return (
		<BasePopover.Title data-slot="popover-title" className={cn(title, className)} {...props} />
	);
}
