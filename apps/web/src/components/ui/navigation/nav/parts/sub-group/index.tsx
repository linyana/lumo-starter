import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type NavSubGroupProps = ComponentProps<'div'>;

export function NavSubGroup({ className, ...props }: NavSubGroupProps) {
	return (
		<div
			data-slot="nav-sub-group"
			className={cn('flex min-w-0 flex-col gap-1', className)}
			{...props}
		/>
	);
}
