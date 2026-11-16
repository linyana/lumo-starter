import { Progress as BaseProgress } from '@base-ui/react/progress';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ProgressTrackProps = Omit<ComponentProps<typeof BaseProgress.Track>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The groove. Its thickness is the one thing worth overriding per call site — `h-1` for a bar in a
 * table row, `h-2` for one that is the subject of the page.
 */
export function ProgressTrack({ className, ...props }: ProgressTrackProps) {
	return (
		<BaseProgress.Track
			data-slot="progress-track"
			className={cn('col-span-2 h-1.5 overflow-hidden rounded-full bg-muted', className)}
			{...props}
		/>
	);
}
