import { ArrowDown, ArrowUp, ArrowUpDown, Ellipsis, ListFilter, RotateCcw } from 'lucide-react';
import { useId, useState, type MouseEvent } from 'react';
import { LumoSkeleton } from '@/components/ui/skeleton';
import { isTableFiltered, LumoTable, type TableSort as AriaSort } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Button } from '../button';
import { ContextMenu, type ContextMenuAnchor } from '../context-menu';
import type { MenuItem } from '../menu';
import { Pagination, type PaginationProps } from '../pagination';
import { Spinner } from '../spinner';
import type { TableColumn, TableFilterProps, TableList, TableProps, TableSort } from './types';

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

const actions = 'Actions';

const noRecords: never[] = [];

const noItems: MenuItem[] = [];

const idOf = (row: unknown) => String((row as { id: unknown }).id);

/**
 * The menu the table has open, whichever half of it asked: the actions of a record from a right press
 * on its row, or a column's own from one on its title. One list, one place on the page.
 */
type OpenMenu = {
	anchor: ContextMenuAnchor;
	items: MenuItem[];
	/** The record it is about. Left out, it belongs to a title and names no row. */
	rowKey?: string;
};

/**
 * Where a press asked for the menu: at the pointer, or at the element itself when the press came from
 * the keyboard, which reports a press at no coordinates at all.
 */
const anchorOf = (event: MouseEvent<HTMLElement>): ContextMenuAnchor =>
	event.clientX === 0 && event.clientY === 0
		? event.currentTarget
		: { x: event.clientX, y: event.clientY };

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

const rowActionReveal = cn(
	'inline-flex opacity-0 pointer-events-none transition-opacity duration-(--duration-state)',
	'group-hover/row:opacity-100 group-hover/row:pointer-events-auto',
	'group-has-[:focus-visible]/row:opacity-100 group-has-[:focus-visible]/row:pointer-events-auto',
);

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
 * The press a column's arrow would make next: the two directions round, then the way back out. The
 * menu says this one thing rather than both directions and a reset, because a list of everything a
 * column could be is one the reader has to read their way out of before they can choose.
 */
function nextSort(sort: AriaSort | undefined): 'ascending' | 'descending' | undefined {
	if (sort === 'ascending') return 'descending';
	if (sort === 'descending') return undefined;

	return 'ascending';
}

/** What the press a column is about to make is called, and the arrow that says the same thing. */
const sortPress = {
	ascending: { label: 'Sort ascending', icon: <ArrowUp /> },
	descending: { label: 'Sort descending', icon: <ArrowDown /> },
	cleared: { label: 'Clear sorting', icon: <ArrowUpDown /> },
} as const;

/**
 * What a title offers about its own column, one line per thing it can do next: the press its arrow would
 * make, and the way out of the column's own narrowing while it is narrowed. Both are read from what the
 * column already declared — `sortKey` and `filter` — so a screen that declares its columns gets its
 * titles' menu without saying anything about it, and `menu` only adds what the table cannot know.
 *
 * A column whose next press is nothing at all — unsortable and unnarrowed, with nothing of its own to
 * add — offers no menu, and a right press on it stays the browser's.
 */
function columnItems<Row, Key extends string>({
	column,
	sort,
	onSort,
}: {
	column: TableColumn<Row, Key>;
	sort: AriaSort | undefined;
	onSort: ((next: AriaSort | undefined) => void) | undefined;
}): MenuItem[] {
	const items: MenuItem[] = [];

	if (onSort !== undefined) {
		const next = nextSort(sort);
		const { label, icon } = next === undefined ? sortPress.cleared : sortPress[next];

		// The current order is the one the title already says with its arrow, so the menu never repeats it:
		// every line here is a press that changes something.
		items.push({ label, icon, onClick: () => onSort(next) });
	}

	const filter: TableFilterProps | undefined = column.filter;
	if (filter !== undefined && filter.onChange !== undefined && isTableFiltered(filter)) {
		items.push({
			label: 'Clear filter',
			icon: <ListFilter />,
			separatorBefore: true,
			onClick: () => clearFilter(filter),
		});
	}

	return [...items, ...(column.menu?.() ?? noItems)];
}

/**
 * The empty answer, in the shape each kind of narrowing reports one: a field is emptied, a set is not.
 * It is the same write the panel behind the icon makes when it is cleared letter by letter, so the two
 * cannot disagree about what "not narrowed" is.
 */
function clearFilter(filter: TableFilterProps): void {
	if ('options' in filter) filter.onChange?.(null);
	else filter.onChange?.('');
}

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
	const [menu, setMenu] = useState<OpenMenu | null>(null);
	const menuRow = menu?.rowKey;

	const data = rows ?? list?.items ?? noRecords;
	const busy = loading ?? list?.loading ?? false;
	const first = initial ?? list?.initial ?? false;
	const failure = error ?? list?.error;
	const retry = onRetry ?? list?.reload;
	const pager = pagination ?? pagerOf(list);
	const skeletonCount = skeletonRows ?? list?.pageSize ?? 5;

	const skeleton = busy && first;
	const masked = busy && !first;

	const paging =
		failure === undefined &&
		pager !== undefined &&
		(pager.total === undefined ? (pager.pageCount ?? 1) > 1 : pager.total > 0);

	const prefix = useId();
	const actionsId = `${prefix}-actions`;
	const cellId = (index: number) => `${prefix}-row-${index}`;

	const actionsOf = (row: Row) => rowActions?.(row) ?? [];

	const openRowMenu = ({ row, anchor }: { row: Row; anchor: ContextMenuAnchor }) => {
		const items = actionsOf(row);
		if (items.length === 0) return;
		setMenu({ items, anchor, rowKey: rowKey(row) });
	};

	// A title's list is built at the press, so a column nobody right-presses costs nothing on every
	// render that draws it.
	const openColumnMenu = ({
		column,
		sort,
		onSort,
		anchor,
	}: {
		column: TableColumn<Row, Key>;
		sort: AriaSort | undefined;
		onSort: ((next: AriaSort | undefined) => void) | undefined;
		anchor: ContextMenuAnchor;
	}) => {
		const items = columnItems({ column, sort, onSort });
		if (items.length === 0) return;
		setMenu({ items, anchor });
	};

	const headed = columns.map((column) => ({
		column,
		sort:
			column.sortKey === undefined
				? undefined
				: ariaSortOf({ sortKey: column.sortKey, sort: sort ?? list?.sort }),
		onSort: sortPressOf({ sortKey: column.sortKey, onSortChange: onSortChange ?? list?.onSort }),
	}));

	const records = data.map((row) => ({ row, key: rowKey(row), items: actionsOf(row) }));
	const withActions =
		rowActions !== undefined && (skeleton || records.some((record) => record.items.length > 0));

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
		<div data-slot="table-block" className="relative min-w-0">
			<LumoTable.Root
				size={size}
				variant={variant}
				hoverable={hoverable && !busy}
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
								onContextMenu={
									column.menu === undefined && onSort === undefined && column.filter === undefined
										? undefined
										: (event) => {
												event.preventDefault();
												openColumnMenu({
													column,
													sort: columnSort,
													onSort,
													anchor: anchorOf(event),
												});
											}
								}
							>
								{column.header}
							</LumoTable.Head>
						))}
						{withActions && (
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
								data-menu-open={menuRow === key ? '' : undefined}
								className={cn(
									classNames?.row,
									withActions && 'group/row',
									'data-menu-open:bg-row-hover',
								)}
								onContextMenu={
									items.length === 0
										? undefined
										: (event) => {
												event.preventDefault();
												openRowMenu({ row, anchor: anchorOf(event) });
											}
								}
							>
								{headed.map(({ column, sort: columnSort }, columnIndex) => (
									<LumoTable.Cell
										key={column.key}
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
													menuRow === key && 'opacity-100 pointer-events-auto',
												)}
											>
												<Button
													variant="ghost"
													size="icon"
													icon={<Ellipsis />}
													aria-labelledby={
														rowActionsLabel === undefined && headed.length > 0
															? `${cellId(index)} ${actionsId}`
															: undefined
													}
													aria-label={rowActionsLabel?.(row)}
													aria-haspopup="menu"
													aria-expanded={menuRow === key}
													onClick={(event) => openRowMenu({ row, anchor: event.currentTarget })}
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
					size={pager.size ?? size}
					range={pager.range ?? true}
					className={cn('pt-3', pager.className, classNames?.footer)}
				/>
			)}

			{masked && (
				<Spinner
					mask
					caption="Loading"
					className={variant === 'borderless' ? undefined : 'rounded-lg'}
				/>
			)}

			<ContextMenu
				anchor={menu?.anchor ?? null}
				items={menu?.items ?? noItems}
				onClose={() => setMenu(null)}
			/>
		</div>
	);
};
