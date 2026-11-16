import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type NavSubItemProps = ComponentProps<'li'>;

export function NavSubItem({ className, ...props }: NavSubItemProps) {
	return (
		<li
			data-slot="nav-sub-item"
			className={cn('group/nav-sub-item relative', className)}
			{...props}
		/>
	);
}
