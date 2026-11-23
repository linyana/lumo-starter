import { Progress as BaseProgress } from '@base-ui/react/progress';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ProgressRootProps = Omit<ComponentProps<typeof BaseProgress.Root>, 'className'> & {
	className?: string;
};

export function ProgressRoot({ className, ...props }: ProgressRootProps) {
	return (
		<BaseProgress.Root
			data-slot="progress"
			className={cn('grid w-full grid-cols-2 gap-y-2', className)}
			{...props}
		/>
	);
}
