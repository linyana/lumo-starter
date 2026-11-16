import { PreviewCard as BasePreviewCard } from '@base-ui/react/preview-card';
import type { ComponentProps } from 'react';
import { viewport } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type HoverCardViewportProps = ComponentProps<typeof BasePreviewCard.Viewport>;

export function HoverCardViewport({ className, ...props }: HoverCardViewportProps) {
	return (
		<BasePreviewCard.Viewport
			data-slot="hover-card-viewport"
			className={cn(viewport, '[--viewport-inline-padding:--spacing(4)] py-4', className)}
			{...props}
		/>
	);
}
