import { ArrowDown, ArrowUp, ArrowUpDown, Ellipsis, ListFilter, RotateCcw } from 'lucide-react';
import { useId, useState, type MouseEvent } from 'react';
import { filterAccess } from '@lumo/shared';
import { LumoSkeleton } from '@/components/ui/skeleton';
import { LumoTable, type TableSort as AriaSort } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useAccess } from '../access';
import { Button } from '../button';
import { ContextMenu, type ContextMenuAnchor } from '../context-menu';
import type { MenuItem } from '../menu';
import { Pagination, type PaginationProps } from '../pagination';
import type { TableColumn, TableFilterProps, TableList, TableProps, TableSort } from './types';

export type {
	TableColumn,
	TableFilterProps,
	TableOrder,
	TableList,
	TableProps,
	TableSlots,
	TableSort,
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
	if (filter?.clear !== undefined && filter.active === true) {
		items.push({
			label: 'Clear filter',
			icon: <ListFilter />,
			separatorBefore: true,
			onClick: filter.clear,
		});
	}

	return [...items, ...(column.menu?.() ?? noItems)];
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
	wait: declared,
	skeletonRows,
	error,
	onRetry,
	empty,
	className,
	classNames,
}: TableProps<Row, Key>) => {
	const [menu, setMenu] = useState<OpenMenu | null>(null);
	const menuRow = menu?.rowKey;

	/**
	 * The columns this app's grant allows: a screen states `access` on the ones that are not for
	 * everyone and hands the whole list over, so the column and the row actions that follow it cannot
	 * disagree about who is reading.
	 */
	const grant = useAccess();
	const visible = filterAccess({ items: columns, grant });

	const data = rows ?? list?.items ?? noRecords;
	const wait = declared ?? list?.wait ?? null;
	const failure = error ?? list?.error;
	const retry = onRetry ?? list?.reload;
	const pager = pagination ?? pagerOf(list);
	const skeletonCount = skeletonRows ?? list?.pageSize ?? 5;

	const paging =
		failure === undefined &&
		pager !== undefined &&
		(pager.total === undefined ? (pager.pageCount ?? 1) > 1 : pager.total > 0);

	const prefix = useId();
	const actionsId = `${prefix}-actions`;
	const cellId = (index: number) => `${prefix}-row-${index}`;

	const actionsOf = (row: Row) => filterAccess({ items: rowActions?.items(row) ?? [], grant });

	/**
	 * Whether the column of actions exists at all. It is the caller's condition answered against the
	 * session, and it goes through the same stripper one row's items go through — so the column and the
	 * rows cannot disagree about who is reading, and the answer never depends on which page is in view.
	 */
	const hasActions =
		rowActions !== undefined && filterAccess({ items: [rowActions], grant }).length > 0;

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
		// A column's own menu lines may carry a condition too — the table's own (a sort step, a clear)
		// never do — so it is stripped here as well: an emptied menu is not opened at all.
		const items = filterAccess({ items: columnItems({ column, sort, onSort }), grant });
		if (items.length === 0) return;
		setMenu({ items, anchor });
	};

	const headed = visible.map((column) => ({
		column,
		sort:
			column.sortKey === undefined
				? undefined
				: ariaSortOf({ sortKey: column.sortKey, sort: sort ?? list?.sort }),
		onSort: sortPressOf({ sortKey: column.sortKey, onSortChange: onSortChange ?? list?.onSort }),
	}));

	const records = data.map((row) => ({ row, key: rowKey(row), items: actionsOf(row) }));

	/** What the row says when it has no records to draw: the failure, the caller's word, or neither. */
	const notice =
		failure !== undefined ? (
			<>
				<p role="alert" className="text-destructive">
					{failure}
				</p>
				{retry !== undefined && (
					<Button
						variant="outline"
						size="sm"
						icon={<RotateCcw />}
						loading={wait !== null}
						onClick={retry}
					>
						Try again
					</Button>
				)}
			</>
		) : empty !== undefined ? (
			empty
		) : (
			<div>
				<p>No records</p>
				{list?.narrowed && (
					<Button variant="ghost" size="sm" onClick={list.clearFilters}>
						Clear filters
					</Button>
				)}
			</div>
		);

	return (
		<div data-slot="table-block" className="relative min-w-0">
			{/*
			 * Only the table waits, and only the records inside it: the pages under it are not records
			 * that have to arrive again, so they are left out of both the box and the ring.
			 */}
			<LumoTable.Root
				size={size}
				variant={variant}
				hoverable={hoverable && wait === null}
				waiting={wait === 'refreshing'}
				aria-busy={wait !== null || undefined}
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
						{hasActions && (
							<LumoTable.Head
								id={actionsId}
								align="end"
								aria-label={actions}
								className={cn(classNames?.head, 'w-px', classNames?.actions)}
							/>
						)}
					</LumoTable.Row>
				</LumoTable.Header>
				<LumoTable.Body aria-hidden={wait === 'opening' || undefined} className={classNames?.body}>
					{wait === 'opening' ? (
						Array.from({ length: skeletonCount }, (_, index) => (
							<LumoTable.Row key={index} className={classNames?.row}>
								{visible.map((column) => (
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
								{hasActions && (
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
							columns={hasActions ? visible.length + 1 : visible.length}
							className={classNames?.empty}
						>
							{notice}
						</LumoTable.Empty>
					) : (
						records.map(({ row, key, items }, index) => (
							<LumoTable.Row
								key={key}
								data-menu-open={menuRow === key ? '' : undefined}
								className={cn(
									classNames?.row,
									hasActions && 'group/row',
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
								{hasActions && (
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
													// The menu is the table's, not Base UI's, so the flag a trigger carries is written
													// here: the button a menu came from stays tinted like one that owns it.
													data-popup-open={menuRow === key ? '' : undefined}
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

			<ContextMenu
				anchor={menu?.anchor ?? null}
				items={menu?.items ?? noItems}
				onClose={() => setMenu(null)}
			/>
		</div>
	);
};
