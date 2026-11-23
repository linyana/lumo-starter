import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type NavSubListProps = ComponentProps<'ul'>;

export function NavSubList({ className, ...props }: NavSubListProps) {
	return (
		<ul
			data-slot="nav-sub-list"
			className={cn(
				'ms-4 me-2 mt-1 flex min-w-0 flex-col gap-1 border-s ps-3',
				'group-data-compact:hidden',
				className,
			)}
			{...props}
		/>
	);
}
