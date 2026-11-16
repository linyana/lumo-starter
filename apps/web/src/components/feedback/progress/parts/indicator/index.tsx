import { Progress as BaseProgress } from '@base-ui/react/progress';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ProgressIndicatorProps = Omit<
	ComponentProps<typeof BaseProgress.Indicator>,
	'className'
> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The fill. While the value is known its width is Base UI's — written as a percentage of the track
 * and eased, so a step from one value to the next is a move rather than a jump.
 *
 * When the value is `null` there is no width to draw, so the fill becomes a segment that sweeps the
 * groove on its own: the bar is saying that the work is happening and how much of it is left is not
 * known. The sweep is the theme's `--animate-progress-sweep`; a reader who asked for less motion
 * gets the segment held still at the start of its travel instead.
 */
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
