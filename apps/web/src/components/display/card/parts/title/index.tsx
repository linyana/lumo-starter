import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type CardTitleProps = ComponentProps<'div'>;

export function CardTitle({ className, ...props }: CardTitleProps) {
	return (
		<div data-slot="card-title" className={cn('text-base font-semibold', className)} {...props} />
	);
}
