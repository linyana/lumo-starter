import { Progress as BaseProgress } from '@base-ui/react/progress';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ProgressValueProps = Omit<ComponentProps<typeof BaseProgress.Value>, 'className'> & {
	className?: string;
};

export function ProgressValue({ className, ...props }: ProgressValueProps) {
	return (
		<BaseProgress.Value
			data-slot="progress-value"
			className={cn('text-right text-sm text-muted-foreground tabular-nums', className)}
			{...props}
		/>
	);
}
