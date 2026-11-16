import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type CardTitleProps = ComponentProps<'div'>;

/**
 * A `div`, not a heading: the level that is right for a card depends on the page around it, and
 * a card cannot know it. Put an `h2`–`h6` inside when the outline matters.
 */
export function CardTitle({ className, ...props }: CardTitleProps) {
	return (
		<div data-slot="card-title" className={cn('text-base font-semibold', className)} {...props} />
	);
}
