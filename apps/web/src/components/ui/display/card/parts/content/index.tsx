import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type CardContentProps = ComponentProps<'div'>;

export function CardContent({ className, ...props }: CardContentProps) {
	return (
		<div data-slot="card-content" className={cn('flex-1 px-(--card-pad)', className)} {...props} />
	);
}
