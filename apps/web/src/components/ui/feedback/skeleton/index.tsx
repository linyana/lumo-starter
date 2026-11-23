import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SkeletonProps = ComponentProps<'div'>;

export function Skeleton({ className, ...props }: SkeletonProps) {
	return (
		<div
			data-slot="skeleton"
			className={cn('animate-pulse rounded-md bg-muted motion-reduce:animate-none', className)}
			{...props}
		/>
	);
}
