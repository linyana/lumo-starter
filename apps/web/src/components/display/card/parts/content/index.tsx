import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type CardContentProps = ComponentProps<'div'>;

export function CardContent({ className, ...props }: CardContentProps) {
	return (
		<div
			data-slot="card-content"
			// Grows into the slack of a stretched card, which keeps a footer on the bottom edge
			// when cards of different heights share a row.
			className={cn('flex-1 px-(--card-pad)', className)}
			{...props}
		/>
	);
}
