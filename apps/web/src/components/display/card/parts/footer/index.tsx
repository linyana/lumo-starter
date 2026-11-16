import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type CardFooterProps = ComponentProps<'div'>;

export function CardFooter({ className, ...props }: CardFooterProps) {
	return (
		<div
			data-slot="card-footer"
			className={cn('flex items-center gap-2 px-(--card-pad)', className)}
			{...props}
		/>
	);
}
