import { Progress as BaseProgress } from '@base-ui/react/progress';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ProgressLabelProps = Omit<ComponentProps<typeof BaseProgress.Label>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

export function ProgressLabel({ className, ...props }: ProgressLabelProps) {
	return (
		<BaseProgress.Label
			data-slot="progress-label"
			className={cn('text-sm', className)}
			{...props}
		/>
	);
}
