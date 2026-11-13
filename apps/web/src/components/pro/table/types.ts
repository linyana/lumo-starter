import type { AccessCondition } from '@lumo/shared';
import type { ReactNode } from 'react';
import type { ListWait } from '@/hooks';
import type { HeadProps, RootProps, TableFilterProps, TableFixed } from '@/components/ui/table';
import type { MenuItem } from '../menu';
import type { PaginationProps } from '../pagination';
import type { SlotClassNames } from '../types';

export type { TableFilterProps, TableFixed } from '@/components/ui/table';

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
	/** The width the column is declared at. A hint under the default layout; where the column ends under `layout="fixed"`. */
	width?: string;
	/**
	 * Pin the column to an edge of the frame: it stays where it is while the columns beside it scroll
	 * under it. The offset is measured from them, so two pinned columns only have to agree on the edge.
	 *
	 * With `width` it is what makes a wide table readable — the records that name a row held on the near
	 * edge and its controls on the far one, and only what is in between moves. The column of actions is
	 * pinned to the end by the table itself, which is why this is the answer for everything before it.
	 */
	fixed?: TableFixed;
	/** Merged onto this column's header and cells, after `classNames.head` and `classNames.cell`. */
	className?: string;
	/**
	 * The condition this column is drawn under. State it and stop: the table strips what the
	 * surrounding `<AccessProvider>` does not grant, so the header, the skeleton and the empty row's
	 * span all count the columns that survived.
	 */
	access?: AccessCondition;
	/**
	 * The key the records are re-read by when this title is pressed. Left out, the column cannot be
	 * sorted: a column of buttons, or one the endpoint does not sort on. Its own `key` is the one the
	 * records are drawn under and is often not a sort key at all.
	 */
	sortKey?: Key;
	/**
	 * A control narrowing this column, behind an icon beside the title. The table draws all of that —
	 * the icon, the popup, its placement, the room inside it, the focus it opens with, the way out —
	 * and the caller hands over one `Field`: bound like any other field, narrowing the column by being
	 * in it. `active` tints the icon and `clear` is the way back, both of them the caller's answers
	 * because the value is the caller's.
	 *
	 * ```tsx
	 * filter: {
	 *   field: <Field name="email"><Input placeholder="Filter by email" /></Field>,
	 *   active: users.filters.email !== undefined,
	 *   clear: () => users.clearFilter('email'),
	 * }
	 * ```
	 */
	filter?: TableFilterProps;
	/**
	 * More of what a right press on this title opens, after the lines the table draws from what the column
	 * already declared: the press its `sortKey`'s arrow would make next, and "Clear filter" while its
	 * `filter` is applied and can be written. This is what the table cannot know — a column's own actions,
	 * such as narrowing to this row's value — and every line in the menu is a press that changes something.
	 */
	menu?: () => MenuItem[];
};

export type TableSlots =
	| 'root'
	| 'header'
	| 'row'
	| 'head'
	| 'body'
	| 'cell'
	| 'actions'
	| 'selection'
	| 'empty'
	| 'skeleton'
	| 'footer';

/**
 * One press a chosen set of records offers, in the bar that floats over them. It is the row's own action
 * shape minus the two things only a single record knows: a menu row's type, and the record it is about —
 * the press is handed the records instead.
 */
export type SelectionAction<Row> = {
	label: ReactNode;
	icon?: ReactNode;
	/** Drawn in the destructive colour. */
	destructive?: boolean;
	/** The session's condition, stripped by the same grant as every other gate on this table. */
	access?: AccessCondition;
	/**
	 * What the chosen records withhold from this press, or nothing when every one of them allows it —
	 * "an account cannot delete itself", "these records are not the same kind". Returned, the press is
	 * drawn unavailable and says this sentence: on hover, and to a reader who tabs to it.
	 *
	 * A rule about *these records* belongs here and not in `access`. That one is about the reader, and it
	 * answers the same for every row; this one is the answer the records themselves give, which is also
	 * why it disables instead of hiding — the records are on the screen and the reader chose them.
	 */
	blocked?: (rows: readonly Row[]) => ReactNode | undefined;
	/** The press, given the records it is about and the way back from choosing them. */
	onClick: (chosen: { rows: readonly Row[]; clear: () => void }) => void;
};

/**
 * What a table reads from a list: the records, the wait they arrive in, how they are ordered, the way
 * through them, and the two things a blank table needs to say the right sentence about itself. It is
 * the shape `useQuery` already returns, so a list screen hands the whole result over — `list={users}` —
 * and names a field of it again only where the table would read it differently.
 */
export type TableList<Row, Key extends string = string> = {
	/** The records on the page in view. */
	items: Row[];
	/** Which wait this is, if any — `opening` before the first answer, `refreshing` after one. */
	wait: ListWait;
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
	 * told one prop at a time — `rows`, `wait`, `sort`, `onSortChange`, `pagination`,
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
	 * Whether a column's declared `width` is where it ends. Left out, the automatic layout weighs the
	 * widths against the content — a column holding a sentence takes the room from one holding a date,
	 * which is that layout doing its job. Stated, every column holds the width it declared, and a table
	 * of cells that are all the same size stops re-deciding its columns on every answer.
	 */
	layout?: RootProps['layout'];
	/**
	 * Which wait this is, if any — the hook's own word, handed over whole with `list`
	 * (`useQuery` returns it). `opening` has nothing behind it, so placeholders take the body's place
	 * under the column names — the shape of what is coming. `refreshing` keeps what the table last
	 * answered with, an empty result and a failure included, and is laid over the records alone: never
	 * the column names, because they are what the answer is read against, and never the pages, because
	 * they are not records that have to arrive again. So a page, a sort or a narrowed column does not
	 * move the row the reader was on, a search that found nothing says so without going blank first, and
	 * the way onwards stays pressable while the records are not.
	 */
	wait?: ListWait;
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
	 *
	 * The "..." is a switch and a right press is not: the button is where the list came from, so the press
	 * that opened it puts it away again, while a right press asks for the list at the pointer every time.
	 *
	 * Each item may carry an `access` block of its own: this is the one place a condition is written per
	 * row, "cannot delete yourself", and the grant strips it before the table decides whether that row
	 * has any actions at all. The column is decided from the same list, with `when` left out — what the
	 * session may act on at all, which does not change from one page to the next. So nothing is stated
	 * twice: a field on the record's own actions is the only place the condition is written.
	 */
	rowActions?: (row: Row) => MenuItem[];
	/**
	 * What a chosen set of records offers, in the bar that floats over them while any are chosen. Its
	 * presence is what makes a row choosable — one declaration, because a selection nothing can be done
	 * with is a reader's time spent for nothing.
	 *
	 * The table keeps the chosen keys and hands the press the records still in view, so a page, a
	 * narrowing, a fresh read or a reload never leaves an action acting on something the reader can no
	 * longer see. The arrows are the caller's in the same place its `rowActions` are.
	 */
	selectionActions?: (chosen: readonly Row[]) => SelectionAction<Row>[];
	/**
	 * What a record is called, for the controls that have to say its name in words — the box in the
	 * selection column. Left out, the record's key is used, which names a row only if the key is a name:
	 * an id is not, and a box announced as "7f3a91" is a box nobody can tell from the one below it.
	 */
	rowLabel?: (row: Row) => string;
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
