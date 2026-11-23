import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type StepsDescriptionProps = ComponentProps<'div'>;

export function StepsDescription({ className, ...props }: StepsDescriptionProps) {
	return (
		<div
			data-slot="steps-description"
			className={cn('text-muted-foreground', className)}
			{...props}
		/>
	);
}
