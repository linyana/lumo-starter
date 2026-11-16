import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type NavListProps = ComponentProps<'ul'>;

export function NavList({ className, ...props }: NavListProps) {
	return (
		<ul
			data-slot="nav-list"
			className={cn('flex w-full min-w-0 flex-col gap-1', className)}
			{...props}
		/>
	);
}
