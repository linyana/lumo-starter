import type { ReactNode } from 'react';
import type { HeadProps, RootProps, TableFilterProps } from '@/components/ui/table';
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
	/** Replaces the body with skeleton rows while keeping the column headers visible. */
	loading?: boolean;
	/** Number of placeholder rows shown while loading. Defaults to 5. */
	skeletonRows?: number;
	/** Shown in a row across every column when there are no records. */
	empty?: ReactNode;
	className?: string;
	classNames?: SlotClassNames<TableSlots>;
};
