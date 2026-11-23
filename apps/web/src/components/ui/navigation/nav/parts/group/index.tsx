import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type NavGroupProps = ComponentProps<'div'>;

export function NavGroup({ className, ...props }: NavGroupProps) {
	return (
		<div
			data-slot="nav-group"
			className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
			{...props}
		/>
	);
}
