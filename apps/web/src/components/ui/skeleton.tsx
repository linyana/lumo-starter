import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type LumoSkeletonProps = ComponentProps<'div'>;

/** Placeholder for content that has not arrived. Give it the size the real content will be. */
export function LumoSkeleton({ className, ...props }: LumoSkeletonProps) {
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
