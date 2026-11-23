import { Progress as BaseProgress } from '@base-ui/react/progress';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ProgressTrackProps = Omit<ComponentProps<typeof BaseProgress.Track>, 'className'> & {
	className?: string;
};

export function ProgressTrack({ className, ...props }: ProgressTrackProps) {
	return (
		<BaseProgress.Track
			data-slot="progress-track"
			className={cn('col-span-2 h-1.5 overflow-hidden rounded-full bg-muted', className)}
			{...props}
		/>
	);
}
