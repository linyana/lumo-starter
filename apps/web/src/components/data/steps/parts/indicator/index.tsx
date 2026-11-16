import { useContext, type ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';
import { StepStatusContext, useSteps } from '../context';

export const stepsIndicatorVariants = tv({
	base: [
		// `z-1` keeps the circle above the connectors: each one is drawn to the centre of the next
		// circle and covered by it, rather than stopped short of it.
		'relative z-1 grid shrink-0 place-items-center rounded-full',
		'size-(--steps-indicator) font-medium tabular-nums select-none',
		'border transition-[color,background-color,border-color]',
		'duration-(--duration-state) ease-(--ease-spring)',
		iconSlot,
	],
	variants: {
		variant: {
			numbered: '',
			// A dot keeps the box, because the connector is positioned from it.
			dot: 'after:size-2 after:rounded-full after:bg-current',
		},
		status: {
			finish: 'border-primary bg-primary text-primary-foreground',
			// Outlined rather than filled: done and now are both the primary colour, and only the
			// fill tells them apart at a glance.
			process: 'border-primary bg-background text-primary',
			wait: 'border-border bg-muted text-muted-foreground',
			error: 'border-destructive bg-destructive text-destructive-foreground',
		},
	},
	compoundVariants: [
		{
			variant: 'dot',
			status: 'finish',
			class: 'border-transparent bg-transparent text-primary',
		},
		{
			variant: 'dot',
			status: 'process',
			class: 'border-transparent bg-primary/15 text-primary',
		},
		{
			variant: 'dot',
			status: 'wait',
			class: 'border-transparent bg-transparent text-muted-foreground',
		},
		{
			variant: 'dot',
			status: 'error',
			class: 'border-transparent bg-transparent text-destructive',
		},
	],
	defaultVariants: {
		variant: 'numbered',
		status: 'wait',
	},
});

export type StepsIndicatorProps = Omit<ComponentProps<'div'>, 'className'> &
	VariantProps<typeof stepsIndicatorVariants> & {
		/** Merged with `cn()`. */
		className?: string;
	};

/** The circle: the number, a check, a glyph a caller handed in, or a dot. */
export function StepsIndicator({
	className,
	variant,
	status,
	children,
	...props
}: StepsIndicatorProps) {
	const context = useSteps();
	const itemStatus = useContext(StepStatusContext);
	const resolvedVariant = variant ?? context.variant;
	const resolvedStatus = status ?? itemStatus ?? 'wait';

	return (
		<div
			data-slot="steps-indicator"
			data-variant={resolvedVariant}
			data-status={resolvedStatus}
			className={cn(
				stepsIndicatorVariants({ variant: resolvedVariant, status: resolvedStatus }),
				className,
			)}
			{...props}
		>
			{resolvedVariant === 'dot' ? null : children}
		</div>
	);
}
