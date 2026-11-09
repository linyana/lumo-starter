import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SkeletonProps = ComponentProps<'div'>;

/** Placeholder for content that has not arrived. Give it the size the real content will be. */
export function Skeleton({ className, ...props }: SkeletonProps) {
	return (
		<div
			data-slot="skeleton"
			className={cn(
				'animate-pulse rounded-md bg-muted motion-reduce:animate-none',
				className,
			)}
			{...props}
		/>
	);
}
