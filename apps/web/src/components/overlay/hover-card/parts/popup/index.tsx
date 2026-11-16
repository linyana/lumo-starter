import { PreviewCard as BasePreviewCard } from '@base-ui/react/preview-card';
import type { ComponentProps } from 'react';
import { popup } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type HoverCardPopupProps = ComponentProps<typeof BasePreviewCard.Popup>;

/**
 * A preview is read rather than used, so the panel is a card: one column of an entity's own
 * details, capped where a line of prose stops being a line. Its width is content-sized — a shorter
 * preview is a narrower card — because the popup's own width is the one a HoverCardViewport animates.
 */
export function HoverCardPopup({ className, ...props }: HoverCardPopupProps) {
	return (
		<BasePreviewCard.Popup
			data-slot="hover-card-popup"
			className={cn(
				'relative rounded-xl border bg-popover p-4 text-popover-foreground shadow-lifted',
				// A HoverCardViewport inside brings its own padding, so this one would double up.
				'has-[>[data-slot=hover-card-viewport]]:p-0',
				'max-w-xs',
				popup,
				className,
			)}
			{...props}
		/>
	);
}
