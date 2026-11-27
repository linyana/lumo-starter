import { PreviewCard as BasePreviewCard } from '@base-ui/react/preview-card';
import type { ComponentProps } from 'react';
import { popup } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type HoverCardPopupProps = ComponentProps<typeof BasePreviewCard.Popup>;

export function HoverCardPopup({ className, ...props }: HoverCardPopupProps) {
	return (
		<BasePreviewCard.Popup
			data-slot="hover-card-popup"
			className={cn(
				'relative rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg',
				'has-[>[data-slot=hover-card-viewport]]:p-0',
				'max-w-xs',
				popup,
				className,
			)}
			{...props}
		/>
	);
}
