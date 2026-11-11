import { Ellipsis, RotateCcw } from 'lucide-react';
import { useId, useState } from 'react';
import { LumoSkeleton } from '@/components/ui/skeleton';
import { LumoTable, type TableSort as AriaSort } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Button } from '../button';
import { ContextMenu, type ContextMenuAnchor } from '../context-menu';
import { Pagination, type PaginationProps } from '../pagination';
import type { TableList, TableProps, TableSort } from './types';

export type {
	TableColumn,
	TableFilterProps,
	TableOptionsFilter,
	TableOrder,
	TableList,
	TableProps,
	TableSlots,
	TableSort,
	TableTextFilter,
} from './types';

/** What the column the table draws itself is called when the caller does not name the press. */
const actions = 'Actions';

/** One empty list for every table that has none, so the records keep their identity between reads. */
const noRecords: never[] = [];

/**
 * A record is known by its `id` unless the caller names its own — an id and never an index, which is
 * what a row's identity has to survive a page, a sort and a deletion above it.
 */
const idOf = (row: unknown) => String((row as { id: unknown }).id);

/** The footer's numbers, read off the list a table was handed — none when it was handed nothing. */
function pagerOf<Row, Key extends string>(
	list: TableList<Row, Key> | undefined,
): PaginationProps | undefined {
	if (list === undefined) return undefined;

	return {
		page: list.page,
		pageCount: list.pageCount,
		total: list.total,
		pageSize: list.pageSize,
		onPageChange: list.setPage,
	};
}

/**
 * The "..." is there when its row is the one being read: the pointer is on it, a control in it has
 * the keyboard, or its menu is open. Either way it keeps its place in the layout — a column that
 * appeared when the pointer arrived would move every column beside it.
 */
const rowActionReveal = cn(
	'inline-flex opacity-0 pointer-events-none transition-opacity duration-(--duration-state)',
	'group-hover/row:opacity-100 group-hover/row:pointer-events-auto',
	'group-has-[:focus-visible]/row:opacity-100 group-has-[:focus-visible]/row:pointer-events-auto',
);

/**
 * Which way a title's arrow points, in `aria-sort`'s own words. A sortable column that is not the
 * one the records arrived in says `none`, which is the quiet, two-headed arrow.
 */
function ariaSortOf<Key extends string>({
	sortKey,
	sort,
}: {
	sortKey: Key;
	sort: TableSort<Key> | undefined;
}): AriaSort {
	if (sort === undefined || sort.key !== sortKey) return 'none';
	return sort.order === 'asc' ? 'ascending' : 'descending';
}

/**
 * A press on a sortable title, told in the caller's words instead of the browser's: the column that
 * was pressed and the direction to read it in, or `undefined` when the cycle has run out. The
 * columns are the ones that know their sort key, so a title reports its own.
 */
function sortPressOf<Key extends string>({
	sortKey,
	onSortChange,
}: {
	sortKey: Key | undefined;
	onSortChange: ((next: TableSort<Key> | undefined) => void) | undefined;
}) {
	if (sortKey === undefined || onSortChange === undefined) return undefined;

	return (next: AriaSort | undefined) =>
		onSortChange(
			next === undefined
				? undefined
				: { key: sortKey, order: next === 'ascending' ? 'asc' : 'desc' },
		);
}

/**
 * Records in columns: the column names once, one row per record, and the empty row when there is
 * none. A column given a `sortKey` becomes a button under a marked `aria-sort`, and reports the
 * press; nothing here reorders the records it was handed.
 *
 * A record's actions are handed over as a list rather than drawn by the caller, which is what lets
 * one list appear in two places: the last column's "..." and the menu a right press opens.
 */
export const Table = <Row, Key extends string = string>({
	columns,
	list,
	rows,
	rowKey = idOf,
	sort,
	onSortChange,
	rowActions,
	rowActionsLabel,
	pagination,
	size = 'md',
	variant = 'borderless',
	hoverable = true,
	loading,
	initial,
	skeletonRows,
	error,
	onRetry,
	empty,
	className,
	classNames,
}: TableProps<Row, Key>) => {
	// The record the open menu is about, and the place it opened at. A menu is opened and closed by
	// the reader rather than by the records handed in, so it is state of the table's own.
	const [menu, setMenu] = useState<{ row: Row; key: string; anchor: ContextMenuAnchor } | null>(
		null,
	);

	// One list, many props: the records, what the wait is doing, the order, the footer's numbers and
	// the failure all come from the same read, so a screen hands the read over and the table asks it
	// the questions a table has. Anything given outright wins — a table read from somewhere other than
	// a list is still a table.
	const data = rows ?? list?.items ?? noRecords;
	const busy = loading ?? list?.loading ?? false;
	const first = initial ?? list?.initial ?? false;
	const failure = error ?? list?.error;
	const retry = onRetry ?? list?.reload;
	const pager = pagination ?? pagerOf(list);
	// The shape of what is coming: one placeholder row per record a page holds.
	const skeletonCount = skeletonRows ?? list?.pageSize ?? 5;

	// Two waits, not one, and which one it is comes from the hook rather than from what the rows
	// hold: a search that matched nothing is still an answer, so the wait after it keeps that answer
	// — and the sentence saying so — on the screen instead of starting over in grey. A read with
	// nothing behind it asks with the shape of the records it is waiting for; one that has an answer
	// keeps it, with the column names, the row the reader was on and the scroll they were at, and says
	// so over the top of it.
	const skeleton = busy && first;
	const masked = busy && !first;

	// A footer is drawn when it has something to say: some records in all, or more than one page of
	// them, and no failure standing in for those records. A line saying "1 / 1" over an empty table is
	// a control that can only be looked at, and the row above it has already said there are no records.
	const paging =
		failure === undefined &&
		pager !== undefined &&
		(pager.total === undefined ? (pager.pageCount ?? 1) > 1 : pager.total > 0);

	// Two ids and not two words: the "..." is named by the row's own first cell and by the strip it
	// stands in — "Ada Lovelace Actions" — because a table of buttons all called "Actions" says which
	// one is which to nobody. The prefix is the table's, so two tables on a page never collide.
	const prefix = useId();
	const actionsId = `${prefix}-actions`;
	const cellId = (index: number) => `${prefix}-row-${index}`;

	const actionsOf = (row: Row) => rowActions?.(row) ?? [];

	// A record with nothing it may be asked to do opens nothing: a right press on it is the browser's,
	// and its row keeps no "..." to press either.
	const openMenu = ({ row, anchor }: { row: Row; anchor: ContextMenuAnchor }) => {
		if (actionsOf(row).length === 0) return;
		setMenu({ row, key: rowKey(row), anchor });
	};

	// One pass over the columns: a title, its arrow and the press it reports are three facts about
	// the same column and the cells have to shade with the same answer.
	const headed = columns.map((column) => ({
		column,
		sort:
			column.sortKey === undefined
				? undefined
				: ariaSortOf({ sortKey: column.sortKey, sort: sort ?? list?.sort }),
		onSort: sortPressOf({ sortKey: column.sortKey, onSortChange: onSortChange ?? list?.onSort }),
	}));

	// The column is worth a strip of its own only while some record has something to offer: a reader
	// who may not act on any row is not shown a column of nothing. One pass over the rows builds what
	// each of them offers — the row's own "..." and the menu under a right press draw the same list.
	const records = data.map((row) => ({ row, key: rowKey(row), items: actionsOf(row) }));
	const withActions =
		rowActions !== undefined && (skeleton || records.some((record) => record.items.length > 0));

	// The row that stands where the records would be, and the reason it is there: the read failed and
	// its press reads again; the caller's own words, when the domain has a better word for it; a
	// narrowing that matched nothing, with the way back to everything; or simply nothing yet. A page
	// left standing under a message that says the last read did not answer is a guess, which is why the
	// failure takes the records' place rather than sitting beside them.
	const blank =
		failure !== undefined ? (
			<>
				<p role="alert" className="text-destructive">
					{failure}
				</p>
				{retry !== undefined && (
					<Button variant="outline" size="sm" icon={<RotateCcw />} loading={busy} onClick={retry}>
						Try again
					</Button>
				)}
			</>
		) : empty !== undefined ? (
			empty
		) : list?.narrowed === true ? (
			<>
				<p>No records match.</p>
				<Button variant="ghost" size="sm" onClick={list.clearFilters}>
					Clear filters
				</Button>
			</>
		) : (
			<p>No records yet.</p>
		);

	return (
		<>
			<LumoTable.Root
				size={size}
				variant={variant}
				hoverable={hoverable && !busy}
				loading={masked}
				aria-busy={busy || undefined}
				className={cn(className, classNames?.root)}
			>
				<LumoTable.Header className={classNames?.header}>
					<LumoTable.Row className={classNames?.row}>
						{headed.map(({ column, sort: columnSort, onSort }) => (
							<LumoTable.Head
								key={column.key}
								align={column.align}
								style={column.width === undefined ? undefined : { width: column.width }}
								className={cn(classNames?.head, column.className)}
								sort={columnSort}
								onSort={onSort}
								filter={column.filter}
							>
								{column.header}
							</LumoTable.Head>
						))}
						{withActions && (
							// The column has no word of its own — the "..." says what it is to the row it is on —
							// so it is named for a reader and drawn as narrow as its control.
							<LumoTable.Head
								id={actionsId}
								align="end"
								aria-label={actions}
								className={cn(classNames?.head, 'w-px', classNames?.actions)}
							/>
						)}
					</LumoTable.Row>
				</LumoTable.Header>
				<LumoTable.Body aria-hidden={skeleton || undefined} className={classNames?.body}>
					{skeleton ? (
						Array.from({ length: skeletonCount }, (_, index) => (
							<LumoTable.Row key={index} className={classNames?.row}>
								{columns.map((column) => (
									<LumoTable.Cell
										key={column.key}
										align={column.align}
										className={cn(classNames?.cell, column.className)}
									>
										<LumoSkeleton
											className={cn(
												'h-5 w-3/4',
												column.align === 'center' && 'mx-auto',
												column.align === 'end' && 'ms-auto',
												classNames?.skeleton,
											)}
										/>
									</LumoTable.Cell>
								))}
								{withActions && (
									<LumoTable.Cell
										align="end"
										className={cn(classNames?.cell, 'w-px', classNames?.actions)}
									>
										<LumoSkeleton className={cn('ms-auto size-6', classNames?.skeleton)} />
									</LumoTable.Cell>
								)}
							</LumoTable.Row>
						))
					) : failure !== undefined || data.length === 0 ? (
						<LumoTable.Empty
							columns={columns.length + (withActions ? 1 : 0)}
							className={classNames?.empty}
						>
							{blank}
						</LumoTable.Empty>
					) : (
						records.map(({ row, key, items }, index) => (
							<LumoTable.Row
								key={key}
								// The row its menu is open for keeps the wash the pointer would have left on it, so the
								// list is still attached to something while the pointer is off in the popup.
								data-menu-open={menu?.key === key ? '' : undefined}
								className={cn(
									classNames?.row,
									withActions && 'group/row',
									'data-[menu-open]:bg-row-hover',
								)}
								// A right press anywhere on the row is the row's, so the list is not one target
								// wide: whatever the reader was pointing at, they were pointing at this record.
								onContextMenu={
									items.length === 0
										? undefined
										: (event) => {
												event.preventDefault();
												openMenu({
													row,
													// A keyboard's context-menu key reports no pointer, so the list opens against the
													// row itself rather than at the page's corner.
													anchor:
														event.clientX === 0 && event.clientY === 0
															? event.currentTarget
															: { x: event.clientX, y: event.clientY },
												});
											}
								}
							>
								{headed.map(({ column, sort: columnSort }, columnIndex) => (
									<LumoTable.Cell
										key={column.key}
										// The first cell is what names the row, here and in the "..." beside it.
										id={columnIndex === 0 ? cellId(index) : undefined}
										align={column.align}
										sort={columnSort}
										className={cn(classNames?.cell, column.className)}
									>
										{column.cell(row)}
									</LumoTable.Cell>
								))}
								{withActions && (
									<LumoTable.Cell
										align="end"
										className={cn(classNames?.cell, 'w-px', classNames?.actions)}
									>
										{items.length > 0 && (
											<span
												className={cn(
													rowActionReveal,
													menu?.key === key && 'opacity-100 pointer-events-auto',
												)}
											>
												<Button
													variant="ghost"
													size="icon"
													icon={<Ellipsis />}
													// Named by the two things a reader needs to know it is this record's: which
													// row it is on, and what pressing it does.
													aria-labelledby={
														rowActionsLabel === undefined && headed.length > 0
															? `${cellId(index)} ${actionsId}`
															: undefined
													}
													aria-label={rowActionsLabel?.(row)}
													aria-haspopup="menu"
													aria-expanded={menu?.key === key}
													onClick={(event) => openMenu({ row, anchor: event.currentTarget })}
												/>
											</span>
										)}
									</LumoTable.Cell>
								)}
							</LumoTable.Row>
						))
					)}
				</LumoTable.Body>
			</LumoTable.Root>

			{paging && (
				<Pagination
					{...pager}
					// The footer is the table's own density unless the caller says otherwise.
					size={pager.size ?? size}
					range={pager.range ?? true}
					className={cn('pt-3', pager.className, classNames?.footer)}
				/>
			)}

			<ContextMenu
				anchor={menu?.anchor ?? null}
				items={menu === null ? [] : actionsOf(menu.row)}
				onClose={() => setMenu(null)}
			/>
		</>
	);
};
