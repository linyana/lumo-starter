import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SelectTriggerGroupProps = Omit<ComponentProps<'div'>, 'className'> & {
	/** Merged with `cn()`. A `w-56` here is what narrows the field. */
	className?: string;
};

/**
 * The box the trigger and its way out share. It holds no look of its own — the trigger does — and
 * exists to be the corner the cross is placed against. The room the cross takes from the value grows
 * only while the cross is mounted, so a select with nothing chosen is not padded for a button that is
 * not there.
 */
export function SelectTriggerGroup({ className, ...props }: SelectTriggerGroupProps) {
	return (
		<div
			data-slot="select-trigger-group"
			className={cn(
				'relative',
				'has-[[data-slot=select-clear]]:[&_[data-slot=select-value]]:pe-6',
				className,
			)}
			{...props}
		/>
	);
}
