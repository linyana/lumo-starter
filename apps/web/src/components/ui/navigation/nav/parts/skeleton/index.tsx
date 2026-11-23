import type { ComponentProps, CSSProperties } from 'react';
import { Skeleton as BaseSkeleton } from '@/components/ui/feedback/skeleton';
import { cn } from '@/lib/utils';

export type NavSkeletonProps = ComponentProps<'div'> & {
	showIcon?: boolean;
	width?: string;
};

export function NavSkeleton({
	className,
	showIcon = false,
	width = '70%',
	...props
}: NavSkeletonProps) {
	return (
		<div
			data-slot="nav-skeleton"
			className={cn(
				'flex h-8 items-center gap-2 rounded-md px-2',
				'group-data-compact:size-8! group-data-compact:justify-center',
				'group-data-compact:gap-0 group-data-compact:px-0',
				className,
			)}
			{...props}
		>
			{showIcon ? (
				<BaseSkeleton data-slot="nav-skeleton-icon" className="size-4" />
			) : (
				<BaseSkeleton
					data-slot="nav-skeleton-initial"
					className="hidden size-4 group-data-compact:block"
				/>
			)}
			<BaseSkeleton
				data-slot="nav-skeleton-text"
				className="h-4 flex-1 group-data-compact:hidden"
				style={{ maxWidth: width } as CSSProperties}
			/>
		</div>
	);
}
