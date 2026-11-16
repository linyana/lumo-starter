import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type CardDescriptionProps = ComponentProps<'div'>;

export function CardDescription({ className, ...props }: CardDescriptionProps) {
	return (
		<div
			data-slot="card-description"
			className={cn('text-sm text-muted-foreground', className)}
			{...props}
		/>
	);
}
