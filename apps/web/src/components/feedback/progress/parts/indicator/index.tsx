import { Progress as BaseProgress } from '@base-ui/react/progress';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ProgressIndicatorProps = Omit<
	ComponentProps<typeof BaseProgress.Indicator>,
	'className'
> & {
	className?: string;
};

export function ProgressIndicator({ className, ...props }: ProgressIndicatorProps) {
	return (
		<BaseProgress.Indicator
			data-slot="progress-indicator"
			className={cn(
				'h-full rounded-full bg-primary',
				'transition-[width] duration-(--duration-overlay) ease-(--ease-overlay)',
				'data-indeterminate:w-2/5 data-indeterminate:animate-progress-sweep',
				'data-indeterminate:motion-reduce:animate-none',
				className,
			)}
			{...props}
		/>
	);
}
