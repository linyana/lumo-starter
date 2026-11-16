import { useMemo, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { NavContext } from '../context';

export type NavRootProps = ComponentProps<'div'> & {
	/** Collapse to one glyph per row. The nav needs nothing else to know how wide it is. */
	compact?: boolean;
};

/**
 * Holds the list's layout, and the one fact a nav has about its container: whether it is a rail.
 * Everything else — width, position, scrolling, whether it lives in a drawer — belongs outside.
 */
export function NavRoot({ compact = false, className, children, ...props }: NavRootProps) {
	const value = useMemo(() => ({ compact }), [compact]);

	return (
		<NavContext.Provider value={value}>
			<div
				data-slot="nav-root"
				data-compact={compact ? '' : undefined}
				className={cn('group flex w-full min-w-0 flex-col gap-1', className)}
				{...props}
			>
				{children}
			</div>
		</NavContext.Provider>
	);
}
