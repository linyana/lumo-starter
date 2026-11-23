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

export const fixedRowStates = cn(
	'before:pointer-events-none before:absolute before:inset-0 before:-z-10',
	'before:rounded-[inherit]',
	'before:bg-row-hover before:opacity-0',
	'before:transition-[opacity,background-color] before:duration-(--duration-state)',
	'[[data-slot=table-container][data-hoverable=true]_tbody>tr:not([data-selected]):hover>&]:before:opacity-100',
	'[tr[data-menu-open]>&]:before:opacity-100',
	'[tr[data-selected]>&]:before:bg-row-selected [tr[data-selected]>&]:before:opacity-100',
	'[tr[data-selected]:hover>&]:before:bg-row-selected-hover',
);

export type TableCellProps = Omit<ComponentProps<'td'>, 'align'> &
	VariantProps<typeof tableCellVariants> & {
		ellipsis?: boolean | { showTitle?: boolean };
		sort?: TableSort;
		fixed?: TableFixed;
		responsive?: TableBreakpoint[];
	};

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
