import { Progress as BaseProgress } from '@base-ui/react/progress';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ProgressRootProps = Omit<ComponentProps<typeof BaseProgress.Root>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The whole bar, laid out as two columns: a label and its value on the first line, the track under
 * both. A caller that wants neither can leave them out and lay the track out itself — the columns
 * the track spans are simply empty.
 */
export function ProgressRoot({ className, ...props }: ProgressRootProps) {
	return (
		<BaseProgress.Root
			data-slot="progress"
			className={cn('grid w-full grid-cols-2 gap-y-2', className)}
			{...props}
		/>
	);
}
