import { Progress as BaseProgress } from '@base-ui/react/progress';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ProgressValueProps = Omit<ComponentProps<typeof BaseProgress.Value>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The number, formatted by Base UI from the same value the bar was given — a percentage unless the
 * call site asks for something else with `format`. Tabular figures, because a running count that
 * changed width would shift the label beside it on every step.
 */
export function ProgressValue({ className, ...props }: ProgressValueProps) {
	return (
		<BaseProgress.Value
			data-slot="progress-value"
			className={cn('text-right text-sm text-muted-foreground tabular-nums', className)}
			{...props}
		/>
	);
}
