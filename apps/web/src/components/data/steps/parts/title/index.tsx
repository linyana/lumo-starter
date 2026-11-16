import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type StepsTitleProps = ComponentProps<'div'>;

/**
 * The name of the step. A `div`, so the heading level is the page's decision, not ours.
 *
 * It keeps the body colour in every status: a step that has not been reached is quiet through its
 * circle and its connector, and dimming the words as well leaves a guide with no `current` — a
 * list of steps nobody is on — reading as a list of things that are switched off.
 */
export function StepsTitle({ className, ...props }: StepsTitleProps) {
	return (
		<div
			data-slot="steps-title"
			className={cn(
				'font-medium text-balance',
				'group-data-[status=error]/step:text-destructive',
				className,
			)}
			{...props}
		/>
	);
}
