import type { ReactNode } from 'react';
import type { HeadProps, RootProps } from '@/components/ui/table';
import type { SlotClassNames } from '../types';

type ColumnAlign = HeadProps['align'];

export type TableColumn<Row> = {
	/** Stable across renders: it is the column's key and the header's. */
	key: string;
	header: ReactNode;
	cell: (row: Row) => ReactNode;
	align?: ColumnAlign;
	/** The width the column is declared at. `layout="fixed"` is what makes it hold. */
	width?: string;
	/** Merged onto this column's header and cells, after `classNames.head` and `classNames.cell`. */
	className?: string;
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

export type TableProps<Row> = {
	columns: TableColumn<Row>[];
	rows: Row[];
	/** How a row is known — an id, not an index. */
	rowKey: (row: Row) => string;
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
