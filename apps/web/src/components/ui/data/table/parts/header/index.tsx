import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { HeaderContext } from '../context';

const StickyHeader = { sticky: true };

const StillHeader = { sticky: false };

export type TableHeaderProps = ComponentProps<'thead'> & {
	sticky?: boolean;
};

export function TableHeader({ sticky = false, className, ...props }: TableHeaderProps) {
	return (
		<HeaderContext value={sticky ? StickyHeader : StillHeader}>
			<thead
				data-slot="table-header"
				data-sticky={sticky ? '' : undefined}
				className={cn('[&>tr>th]:bg-table-head [&>tr>th]:after:opacity-0', className)}
				{...props}
			/>
		</HeaderContext>
	);
}
