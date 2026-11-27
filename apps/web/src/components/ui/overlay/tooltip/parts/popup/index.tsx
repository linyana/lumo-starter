import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { ComponentProps } from 'react';
import { popup } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type TooltipPopupProps = ComponentProps<typeof BaseTooltip.Popup>;

export function TooltipPopup({ className, ...props }: TooltipPopupProps) {
	return (
		<BaseTooltip.Popup
			data-slot="tooltip-popup"
			className={cn(
				'relative rounded-md bg-primary text-xs',
				'text-primary-foreground shadow-lg',
				'px-2.5 py-1',
				'has-[>[data-slot=tooltip-viewport]]:p-0',
				'max-w-xs',
				popup,
				className,
			)}
			{...props}
		/>
	);
}
