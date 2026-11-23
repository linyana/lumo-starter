import type { ComponentProps } from 'react';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';

export type NavGroupLabelProps = ComponentProps<'div'>;

export function NavGroupLabel({ className, ...props }: NavGroupLabelProps) {
	return (
		<div
			data-slot="nav-group-label"
			className={cn(
				'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-muted-foreground',
				'truncate',
				'transition-[margin,opacity] duration-(--duration-state) ease-linear',
				'group-data-compact:-mt-8 group-data-compact:opacity-0',
				iconSlot,
				className,
			)}
			{...props}
		/>
	);
}
