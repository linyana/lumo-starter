import type { ComponentProps } from 'react';
import type { VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import {
	ellipsisCell,
	fixedClass,
	responsiveClass,
	rowCellEnds,
	tableCellVariants,
	textOf,
	type TableBreakpoint,
	type TableFixed,
} from '../head';
import type { TableSort } from '../root';
import { rowCellWash } from '../row';

export /**
 * The washes a row can show, on a pinned cell. The cell's fill is opaque — nothing may be read
 * through a column standing in front of the others — so a translucent row state is laid on top of
 * it as a layer instead of replacing it.
 *
 * A row's own wash is the row's to paint, and a pinned cell is the one cell that does not sit on it:
 * whichever state the host sets on the row has to be repeated here. Hover is the table's own, and
 * `data-menu-open` is what a host marks a row with while its menu is open.
 */
const fixedRowStates = cn(
	// Below the cell's own content, above its fill, so the wash tints the row and not the words in it.
	'before:pointer-events-none before:absolute before:inset-0 before:-z-10',
	// The wash is a box of its own and takes the corner the cell was given, so a wash on the last cell of
	// a row ends where the row does.
	'before:rounded-[inherit]',
	'before:bg-row-hover before:opacity-0',
	'before:transition-[opacity,background-color] before:duration-(--duration-state)',
	'[[data-slot=table-container][data-hoverable=true]_tbody>tr:not([data-selected]):hover>&]:before:opacity-100',
	// The row is washed by the host while the menu it opened is up; this is that wash, and it stands
	// before the selected rules so a chosen row keeps its own tint under the popup.
	'[tr[data-menu-open]>&]:before:opacity-100',
	'[tr[data-selected]>&]:before:bg-row-selected [tr[data-selected]>&]:before:opacity-100',
	'[tr[data-selected]:hover>&]:before:bg-row-selected-hover',
);

export type TableCellProps = Omit<ComponentProps<'td'>, 'align'> &
	VariantProps<typeof tableCellVariants> & {
		/** Cut the cell off at the column's width, and keep the whole of it in `title`. */
		ellipsis?: boolean | { showTitle?: boolean };
		/**
		 * The direction its column is displayed in, as `TableHead` was told. The title uses it to
		 * say where the column sits; the cells themselves are not shaded.
		 */
		sort?: TableSort;
		/**
		 * Pin the column to an edge of the frame, exactly as its `TableHead` does: the offset is
		 * measured from the columns beside it, so the two only have to agree on the edge.
		 */
		fixed?: TableFixed;
		/** Show the column from a breakpoint up. Give the same list to its `TableHead`. */
		responsive?: TableBreakpoint[];
	};

/** One field of one record. */
export function TableCell({
	align = 'start',
	ellipsis = false,
	sort,
	fixed,
	responsive,
	title,
	className,
	children,
	...props
}: TableCellProps) {
	const showTitle = typeof ellipsis === 'object' ? ellipsis.showTitle !== false : true;

	return (
		<td
			data-slot="table-cell"
			data-align={align}
			data-sort={sort}
			data-fixed={fixed}
			data-ellipsis={ellipsis ? '' : undefined}
			title={title ?? (ellipsis && showTitle ? textOf(children) : undefined)}
			className={cn(
				tableCellVariants({ align }),
				ellipsis && ellipsisCell,
				// A pinned cell paints its own fill and lays the wash over it, so the row's colour reaches it a
				// way down — `fixedRowStates` is that way, and this is the other.
				fixed === undefined && rowCellWash,
				rowCellEnds,
				fixed !== undefined && 'z-1',
				fixedClass(fixed),
				responsiveClass(responsive),
				className,
			)}
			{...props}
		>
			{children}
		</td>
	);
}
