import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ToastProgressProps = Omit<ComponentProps<'div'>, 'style'> & {
	timeout: number;
};

export function ToastProgress({ timeout, className, ...props }: ToastProgressProps) {
	return (
		<div
			data-slot="toast-progress"
			className={cn(
				'pointer-events-none absolute inset-x-0 bottom-0 h-4 overflow-hidden rounded-b-[inherit]',
				className,
			)}
			{...props}
		>
			<div
				data-slot="toast-progress-indicator"
				className={cn(
					'absolute inset-x-0 bottom-0 h-1 origin-left bg-primary',
					'animate-[toast-progress_linear_forwards]',
					'group-data-expanded/toast:[animation-play-state:paused]',
				)}
				style={{ animationDuration: `${timeout}ms` }}
			/>
		</div>
	);
}
