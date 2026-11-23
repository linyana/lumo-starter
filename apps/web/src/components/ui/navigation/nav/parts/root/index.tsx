import { useMemo, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { NavContext } from '../context';

export type NavRootProps = ComponentProps<'div'> & {
	compact?: boolean;
};

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
