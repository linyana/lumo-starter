import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SkeletonEffect = 'shimmer' | 'pulse' | 'none';

export type SkeletonProps = ComponentProps<'div'> & {
	effect?: SkeletonEffect;
};

const effectClasses: Record<SkeletonEffect, string> = {
	shimmer: 'skeleton-shimmer',
	pulse: 'motion-safe:animate-pulse',
	none: '',
};

export function Skeleton({ effect = 'shimmer', className, ...props }: SkeletonProps) {
	return (
		<div
			data-slot="skeleton"
			data-effect={effect}
			aria-hidden="true"
			className={cn(
				'relative block shrink-0 overflow-hidden rounded-md bg-muted/70',
				effectClasses[effect],
				className,
			)}
			{...props}
		/>
	);
}
