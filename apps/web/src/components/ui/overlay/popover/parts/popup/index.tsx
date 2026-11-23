import { Popover as BasePopover } from '@base-ui/react/popover';
import type { ComponentProps } from 'react';
import { popup } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type PopoverPopupProps = ComponentProps<typeof BasePopover.Popup>;

export function PopoverPopup({ className, ...props }: PopoverPopupProps) {
	return (
		<BasePopover.Popup
			data-slot="popover-popup"
			className={cn(
				'relative rounded-lg border bg-popover text-popover-foreground p-3 shadow-lifted',
				'has-[>[data-slot=popover-viewport]]:p-0',
				'max-w-md',
				popup,
				className,
			)}
			{...props}
		/>
	);
}
