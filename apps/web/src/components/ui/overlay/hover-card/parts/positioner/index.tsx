import { PreviewCard as BasePreviewCard } from '@base-ui/react/preview-card';
import type { ComponentProps } from 'react';
import { positioner } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type HoverCardPositionerProps = ComponentProps<typeof BasePreviewCard.Positioner>;

export function HoverCardPositioner({
	className,
	sideOffset = 8,
	...props
}: HoverCardPositionerProps) {
	return (
		<BasePreviewCard.Positioner
			data-slot="hover-card-positioner"
			sideOffset={sideOffset}
			className={cn('z-50', positioner, className)}
			{...props}
		/>
	);
}
