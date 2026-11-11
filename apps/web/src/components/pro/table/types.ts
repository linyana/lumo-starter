import type { ReactNode } from 'react';
import type { HeadProps, RootProps, TableFilterProps } from '@/components/ui/table';
import type { MenuItem } from '../menu';
import type { SlotClassNames } from '../types';

export type { TableFilterProps, TableOptionsFilter, TableTextFilter } from '@/components/ui/table';

type ColumnAlign = HeadProps['align'];

/** Which way round a sorted column reads. */
export type TableOrder = 'asc' | 'desc';

/** The column the records arrived in, and which way round. */
export type TableSort<Key extends string = string> = { key: Key; order: TableOrder };

export type TableColumn<Row, Key extends string = string> = {
	/** Stable across renders: it is the column's key and the header's. */
	key: string;
	header: ReactNode;
	cell: (row: Row) => ReactNode;
	align?: ColumnAlign;
	/** The width the column is declared at. `layout="fixed"` is what makes it hold. */
	width?: string;
	/** Merged onto this column's header and cells, after `classNames.head` and `classNames.cell`. */
	className?: string;
	/**
	 * The key the records are re-read by when this title is pressed. Left out, the column cannot be
	 * sorted: a column of buttons, or one the endpoint does not sort on. Its own `key` is the one the
	 * records are drawn under and is often not a sort key at all.
	 */
	sortKey?: Key;
	/**
	 * A panel behind an icon beside the title, narrowing this column: a set of its own values, or a
	 * field the reader types into. The value and the way back are the caller's, exactly as the title's
	 * sort is — the panel draws what it is handed and reports what was pressed.
	 */
	filter?: TableFilterProps;
};

export type TableSlots =
	| 'root'
	| 'header'
	| 'row'
	| 'head'
	| 'body'
	| 'cell'
	| 'actions'
	| 'empty'
	| 'skeleton';

export type TableProps<Row, Key extends string = string> = {
	columns: TableColumn<Row, Key>[];
	rows: Row[];
	/** How a row is known — an id, not an index. */
	rowKey: (row: Row) => string;
	/** The column the records arrived sorted by, and which way round. Left out, no title is marked. */
	sort?: TableSort<Key>;
	/**
	 * A sortable title was pressed, with the state it now means. The step after the last direction
	 * is `undefined`: the reader has stopped sorting, and the order the records arrived in is back.
	 * Ordering them is still the caller's — a table that sorted what it was handed would be quietly
	 * disagreeing with whoever fetched it.
	 */
	onSortChange?: (next: TableSort<Key> | undefined) => void;
	size?: RootProps['size'];
	variant?: RootProps['variant'];
	hoverable?: boolean;
	/**
	 * A read is in flight. What that looks like is the table's to decide from what it was handed: with
	 * no records to keep it replaces the body with skeleton rows under the column names — the shape of
	 * what is coming — and with records it keeps them and covers them with a spinner, so a page, a sort
	 * or a narrowed column does not move the row the reader was on. So the first wait is the skeleton
	 * and every wait after it is the mask.
	 */
	loading?: boolean;
	/** Number of placeholder rows shown while the first wait is in flight. Defaults to 5. */
	skeletonRows?: number;
	/** Shown in a row across every column when there are no records. */
	empty?: ReactNode;
	/**
	 * The actions a record offers, in the two places a reader looks for them: the last column keeps an
	 * "..." on the row the pointer is on, and a right press anywhere on the row opens the same list at
	 * the pointer. One list is drawn twice — a record with no actions gets neither, so a row a reader
	 * may not act on says nothing about it.
	 */
	rowActions?: (row: Row) => MenuItem[];
	/** What a record's "..." is called. Defaults to "Actions". */
	rowActionsLabel?: (row: Row) => string;
	className?: string;
	classNames?: SlotClassNames<TableSlots>;
};
