import { useContext, type ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { StepStatusContext, useSteps } from '../context';

export const stepsSeparatorVariants = tv({
	base: 'rounded-full',
	variants: {
		orientation: {
			// Laid out after the content and pulled into the next circle's box, so it reaches that
			// circle's centre at every size. A filled circle covers what runs under it; a dot does
			// not, which is why the connector has to be the one to travel.
			horizontal: [
				'h-px min-w-4 flex-1',
				// `--steps-indicator/2` puts it on the circles' centre line, the rest is the pull.
				'mt-[calc(var(--steps-indicator)/2)]',
				'-me-[calc(var(--steps-indicator)/2_-_var(--spacing))]',
			],
			// Absolute: it has to leave the circle at an exact point on the item's height, and it
			// runs from centre to centre so the padding between two items is always covered.
			vertical: [
				'absolute w-0.5',
				'start-[calc(var(--steps-indicator)/2_-_1px)]',
				'top-[calc(var(--steps-indicator)/2)] -bottom-[calc(var(--steps-indicator)/2)]',
			],
		},
		/** The connector reports the step it leaves, not the one it arrives at. */
		status: {
			finish: 'bg-primary',
			process: 'bg-border',
			wait: 'bg-border',
			error: 'bg-border',
		},
	},
	defaultVariants: {
		orientation: 'horizontal',
		status: 'wait',
	},
});

export type StepsSeparatorProps = Omit<ComponentProps<'div'>, 'className'> &
	VariantProps<typeof stepsSeparatorVariants> & {
		/** Merged with `cn()`. */
		className?: string;
	};

/** The line between two indicators. Decorative: the order is the list's. */
export function StepsSeparator({ className, orientation, status, ...props }: StepsSeparatorProps) {
	const context = useSteps();
	const itemStatus = useContext(StepStatusContext);
	const resolvedOrientation = orientation ?? context.orientation;
	const resolvedStatus = status ?? itemStatus ?? 'wait';

	return (
		<div
			data-slot="steps-separator"
			data-status={resolvedStatus}
			aria-hidden="true"
			className={cn(
				stepsSeparatorVariants({
					orientation: resolvedOrientation,
					status: resolvedStatus,
				}),
				'group-last/step:hidden',
				className,
			)}
			{...props}
		/>
	);
}
