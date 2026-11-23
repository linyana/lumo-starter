import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type NavBadgeProps = ComponentProps<'div'>;

export function NavBadge({ className, ...props }: NavBadgeProps) {
	return (
		<div
			data-slot="nav-badge"
			className={cn(
				'pointer-events-none absolute inset-e-1 flex h-5 min-w-5 items-center justify-center',
				'rounded-md px-1 text-xs font-medium tabular-nums select-none',
				'peer-hover/nav-button:text-accent-foreground',
				'peer-data-active/nav-button:text-accent-foreground',
				'peer-data-[size=sm]/nav-button:top-1',
				'peer-data-[size=md]/nav-button:top-1.5',
				'peer-data-[size=lg]/nav-button:top-2.5',
				'group-data-compact:hidden',
				className,
			)}
			{...props}
		/>
	);
}
