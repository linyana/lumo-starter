import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SelectTriggerGroupProps = Omit<ComponentProps<'div'>, 'className'> & {
	className?: string;
};

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
