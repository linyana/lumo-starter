import type { ReactNode } from 'react';
import type { HeadProps, RootProps, TableFilterProps } from '@/components/ui/table';
import type { MenuItem } from '../menu';
import type { PaginationProps } from '../pagination';
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
	| 'skeleton'
	| 'footer';

/**
 * What a table reads from a list: the records, the wait they arrive in, how they are ordered, the way
 * through them, and the two things a blank table needs to say the right sentence about itself. It is
 * the shape `useList` already returns, so a list screen hands the whole result over — `list={users}` —
 * and names a field of it again only where the table would read it differently.
 */
export type TableList<Row, Key extends string = string> = {
	/** The records on the page in view. */
	items: Row[];
	loading: boolean;
	/** No read has answered yet, so this wait has nothing behind it. */
	initial: boolean;
	/** The column the records were read by, and which way. */
	sort: TableSort<Key>;
	/** A title was pressed: the order to read them by next. */
	onSort: (next: TableSort<Key> | undefined) => void;
	page: number;
	pageCount: number;
	pageSize: number;
	total: number;
	setPage: (page: number) => void;
	/** The API's sentence when the last read failed. It takes the place of the records. */
	error?: string;
	/** Read the page again — what the failure row's press does. */
	reload: () => void;
	/** Something was narrowed, so a blank table means "nothing matched" rather than "nothing yet". */
	narrowed: boolean;
	/** Drops every filter in one write — what the "nothing matched" row offers. */
	clearFilters: () => void;
};

export type TableProps<Row, Key extends string = string> = {
	columns: TableColumn<Row, Key>[];
	/**
	 * The list the records came from, handed over whole. It fills in what a table would otherwise be
	 * told one prop at a time — `rows`, `loading`, `initial`, `sort`, `onSortChange`, `pagination`,
	 * `skeletonRows`, `error`, `onRetry` and the two empty-state facts — so a list screen passes four
	 * props instead of ten. Each of those stays setable on its own and wins over the list, which is
	 * what a screen reading from somewhere else needs.
	 */
	list?: TableList<Row, Key>;
	/** The records, when the list they came from is not handed over whole. */
	rows?: Row[];
	/**
	 * How a row is known. Left out, the record's own `id` — an id and never an index, because a row
	 * has to keep its identity across a page, a sort and a deletion above it.
	 */
	rowKey?: (row: Row) => string;
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
	 * A read is in flight — the list's own when one is handed over. What that looks like is `initial`'s
	 * answer: the wait a table opens with has
	 * nothing behind it, so it replaces the body with skeleton rows under the column names — the shape
	 * of what is coming — and every wait after it keeps what the table last answered with, an empty
	 * result included, and covers it with a spinner. So a page, a sort or a narrowed column does not
	 * move the row the reader was on, and a search that found nothing says so without going blank first.
	 */
	loading?: boolean;
	/**
	 * No read has answered yet, so this wait is the first one — hand it the hook's own
	 * (`initial={users.initial}`). Left out, every wait is treated as a later one and covers what is
	 * on the screen rather than replacing it.
	 */
	initial?: boolean;
	/** Number of placeholder rows shown while the first wait is in flight. Defaults to a page of them. */
	skeletonRows?: number;
	/**
	 * The API's sentence when the last read failed. It stands where the records would be — a page left
	 * under a message that says the last read did not answer is a guess — and with `onRetry` the row
	 * also offers the press that reads again. `list` fills both in from its own failure and `reload`.
	 */
	error?: ReactNode;
	/** The press in the failure row: read it again. Left out, the row is the sentence alone. */
	onRetry?: () => void;
	/**
	 * The row shown when there is nothing to show, whatever the reason. Left out, the table says one of
	 * the three things itself: the read failed, something was narrowed and nothing matched (with the
	 * press that unnarrows it), or nothing has been recorded yet. Use it for the word the domain uses —
	 * "No accounts yet" — and for nothing else.
	 */
	empty?: ReactNode;
	/**
	 * The actions a record offers, in the two places a reader looks for them: the last column keeps an
	 * "..." on the row the pointer is on, and a right press anywhere on the row opens the same list at
	 * the pointer. One list is drawn twice — a record with no actions gets neither, so a row a reader
	 * may not act on says nothing about it.
	 */
	rowActions?: (row: Row) => MenuItem[];
	/**
	 * What a record's "..." is called. Left out, it is named from the two things around it — the row's
	 * first cell and the strip it stands in, so "Ada Lovelace Actions" — which is what tells one row's
	 * button from the next in a table where every one of them is an ellipsis.
	 */
	rowActionsLabel?: (row: Row) => string;
	/**
	 * The way through the records, drawn under them: the count on the start and the numbers on the end,
	 * at the table's own size. It is the same object a `Pagination` takes, because it is one — the
	 * table only decides where the line goes. Left out, it comes from the list if one was handed over;
	 * without either, the table has no footer. A footer with nothing
	 * to say — no records, one page of nobody's records — is not drawn either.
	 */
	pagination?: PaginationProps;
	className?: string;
	classNames?: SlotClassNames<TableSlots>;
};
