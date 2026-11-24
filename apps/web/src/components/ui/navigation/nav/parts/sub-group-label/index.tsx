import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type NavSubGroupLabelProps = ComponentProps<'div'>;

export function NavSubGroupLabel({ className, ...props }: NavSubGroupLabelProps) {
	return (
		<div
			data-slot="nav-sub-group-label"
			className={cn(
				'flex h-7 shrink-0 items-center truncate px-2 text-xs font-medium text-muted-foreground',
				className,
			)}
			{...props}
		/>
	);
}
