import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { HeaderContext } from '../context';

/** Two of them, so the provider's value is a constant rather than an object built per render. */
const StickyHeader = { sticky: true };

const StillHeader = { sticky: false };

export type TableHeaderProps = ComponentProps<'thead'> & {
	/**
	 * Holds the column names in place while the rows pass under them, which is what a table with a
	 * height needs. Every row of the header holds, so a grouped header stacks: each row is measured
	 * and starts under the one above it. The frame needs a ceiling — `scroll={{ y }}` or a height
	 * class — and the header sticks to that frame, not to the page around it.
	 */
	sticky?: boolean;
};

/**
 * The band the column names sit in. It is a wash of the text colour over whatever surface the table
 * is on — faint, because it names the columns and is not a record itself — but it is opaque, which
 * is what a sticky header needs when the rows pass under it.
 */
export function TableHeader({ sticky = false, className, ...props }: TableHeaderProps) {
	return (
		<HeaderContext value={sticky ? StickyHeader : StillHeader}>
			<thead
				data-slot="table-header"
				data-sticky={sticky ? '' : undefined}
				// The band names the columns and needs no line under it to say where it ends: the tone is the
				// boundary, and a rule there would be the one line in the table that no record owns.
				className={cn('[&>tr>th]:bg-table-head [&>tr>th]:after:hidden', className)}
				{...props}
			/>
		</HeaderContext>
	);
}
