import type { ComponentProps } from 'react';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';

export type NavGroupLabelProps = ComponentProps<'div'>;

/** Collapses to nothing in the compact nav, so the rows can stack without a heading. */
export function NavGroupLabel({ className, ...props }: NavGroupLabelProps) {
	return (
		<div
			data-slot="nav-group-label"
			className={cn(
				'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-muted-foreground',
				// Hidden in the rail, but the text stays in the DOM — truncating keeps it from
				// pushing a horizontal scrollbar out of a 3rem column.
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
