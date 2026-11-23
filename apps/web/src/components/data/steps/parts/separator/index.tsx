import { useContext, type ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { StepStatusContext, useSteps } from '../context';

export const stepsSeparatorVariants = tv({
	base: 'rounded-full',
	variants: {
		orientation: {
			horizontal: [
				'h-px min-w-4 flex-1',
				'mt-[calc(var(--steps-indicator)/2)]',
				'-me-[calc(var(--steps-indicator)/2_-_var(--spacing))]',
			],
			vertical: [
				'absolute w-0.5',
				'start-[calc(var(--steps-indicator)/2_-_1px)]',
				'top-[calc(var(--steps-indicator)/2)] -bottom-[calc(var(--steps-indicator)/2)]',
			],
		},
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
		className?: string;
	};

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
