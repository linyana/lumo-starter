import { PreviewCard as BasePreviewCard } from '@base-ui/react/preview-card';
import type { ComponentProps } from 'react';
import { arrow } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type HoverCardArrowProps = ComponentProps<typeof BasePreviewCard.Arrow>;

export function HoverCardArrow({ className, ...props }: HoverCardArrowProps) {
	return (
		<BasePreviewCard.Arrow
			data-slot="hover-card-arrow"
			className={cn(arrow, 'before:border before:border-border before:bg-popover', className)}
			{...props}
		/>
	);
}
