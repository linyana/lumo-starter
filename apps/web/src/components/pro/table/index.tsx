import { ArrowDown, ArrowUp, ArrowUpDown, Ellipsis, ListFilter, RotateCcw } from 'lucide-react';
import { useId, useState, type MouseEvent } from 'react';
import { filterAccess, permits } from '@lumo/shared';
import { ActionBar } from '@/components/action-bar';
import { LumoSkeleton } from '@/components/ui/skeleton';
import { LumoTable, type TableSort as AriaSort } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useAccess } from '../access';
import { Button } from '../button';
import { ContextMenu, type ContextMenuAnchor } from '../context-menu';
import type { MenuItem } from '../menu';
import { Pagination, type PaginationProps } from '../pagination';
import { Tooltip } from '../tooltip';
import type {
	SelectionAction,
	TableColumn,
	TableFilterProps,
	TableList,
	TableProps,
	TableSort,
} from './types';

export type {
	SelectionAction,
	TableColumn,
	TableFilterProps,
	TableFixed,
	TableOrder,
	TableList,
	TableProps,
	TableSlots,
	TableSort,
} from './types';

const actions = 'Actions';

const noRecords: never[] = [];

const noItems: MenuItem[] = [];

const noChosen: string[] = [];

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

/**
 * The room the column of actions is held at: one icon button, and the cell's own inset on either side,
 * read from the variable the size variant writes. Held rather than left to the content, so the column
 * does not breathe as the "..." comes and goes on hover — and so a sized header and its cells agree.
 */
const actionsWidth = 'calc(var(--spacing) * 8 + var(--cell-px) * 2)';

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

type SelectionBarProps<Row> = {
	rows: readonly Row[];
	actions: (rows: readonly Row[]) => SelectionAction<Row>[];
	onClear: () => void;
	className?: string;
};

/**
 * What the table puts in the floating bar while records are chosen: how many, what can be done with
 * them, and the way back. The list is the caller's minus what the session is not granted, and an action
 * the chosen records withhold is drawn unavailable with the reason on it rather than dropped — the
 * records are on the screen and the reader chose them, so "not these, because…" is the answer, not
 * silence.
 */
const SelectionBar = <Row,>({ rows, actions, onClear, className }: SelectionBarProps<Row>) => {
	const grant = useAccess();
	const prefix = useId();
	const offered = rows.length === 0 ? [] : filterAccess({ items: actions(rows), grant });

	return (
		<ActionBar visible={rows.length > 0} className={className}>
			<p aria-live="polite" className="text-sm font-medium">
				{rows.length === 1 ? '1 selected' : `${rows.length} selected`}
			</p>
			<div className="flex flex-wrap items-center gap-2">
				{offered.map((action, index) => {
					const reason = action.blocked?.(rows);
					const look = {
						variant: 'outline' as const,
						size: 'sm' as const,
						icon: action.icon,
						tone: action.destructive ? ('destructive' as const) : ('default' as const),
					};
					const why = `${prefix}-blocked-${index}`;

					return reason === undefined ? (
						<Button key={index} {...look} onClick={() => action.onClick({ rows, clear: onClear })}>
							{action.label}
						</Button>
					) : (
						// The press keeps its name and its place and stops being a press. It stays focusable so
						// the sentence is not hover-only, and the hint hangs on the wrap: a disabled button takes
						// no pointer events, so a tooltip anchored to the button itself would never arrive.
						<Tooltip key={index} content={reason}>
							<span className="inline-flex">
								<Button {...look} disabled focusableWhenDisabled aria-describedby={why}>
									{action.label}
								</Button>
								<span id={why} className="sr-only">
									{reason}
								</span>
							</span>
						</Tooltip>
					);
				})}
				<Button variant="ghost" size="sm" onClick={onClear}>
					Clear
				</Button>
			</div>
		</ActionBar>
	);
};

export const Table = <Row, Key extends string = string>({
	columns,
	list,
	rows,
	rowKey = idOf,
	sort,
	onSortChange,
	rowActions,
	rowActionsLabel,
	rowLabel,
	selectionActions,
	pagination,
	size = 'md',
	variant = 'borderless',
	hoverable = true,
	layout = 'auto',
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
	const [chosenKeys, setChosenKeys] = useState<string[]>(noChosen);

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

	/** What one record offers, before the grant strips it. */
	const declaredOf = (row: Row) => rowActions?.(row) ?? noItems;
	const actionsOf = (row: Row) => filterAccess({ items: declaredOf(row), grant });

	/**
	 * Whether the column of actions exists at all, read from the same list the rows below it are drawn
	 * from — so the column and the rows cannot disagree about who is reading. It asks only the session's
	 * half of each condition (`permits`): `when` is one record's answer about its own data, and a column
	 * whose existence followed it would come and go as the records do. With nothing in view to ask — the
	 * first read, an empty page — the column is drawn as declared, the skeleton with it, because a
	 * skeleton is a promise and there is no record yet to keep it.
	 */
	const hasActions =
		rowActions !== undefined &&
		(data.length === 0 ||
			data.some((row) =>
				declaredOf(row).some((item) => permits({ condition: item.access, grant })),
			));

	const openRowMenu = ({ row, anchor }: { row: Row; anchor: ContextMenuAnchor }) => {
		const items = actionsOf(row);
		if (items.length === 0) return;
		setMenu({ items, anchor, rowKey: rowKey(row) });
	};

	/**
	 * The press on a record's "...": a switch, not an opener. The button is where the menu came from, so
	 * a second press puts it away — the same press that opened it is the one that closes it, which is
	 * what a reader tries first. A right press is not this: it asks for the menu at the pointer and is
	 * answered there every time, because a right press on a row is a request to see what it offers, not a
	 * toggle on something the reader has to already know is open.
	 */
	const toggleRowMenu = ({
		row,
		key,
		anchor,
	}: {
		row: Row;
		key: string;
		anchor: ContextMenuAnchor;
	}) => {
		if (menuRow === key) {
			setMenu(null);
			return;
		}

		const items = actionsOf(row);
		if (items.length === 0) return;
		setMenu({ items, anchor, rowKey: key });
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

	/**
	 * The records a reader has chosen, kept as keys because a page is what the table draws: the answer is
	 * the chosen keys still in view, so a fresh read, another page or a narrowed column never leaves a
	 * press acting on something that is no longer on the screen.
	 */
	const keys = records.map((one) => one.key);
	const chosen = chosenKeys.filter((key) => keys.includes(key));
	const chosenRows = records.filter((one) => chosen.includes(one.key)).map((one) => one.row);
	const choosable =
		selectionActions === undefined
			? undefined
			: {
					keys,
					value: chosen,
					onChange: (next: string[]) => setChosenKeys(next.filter((key) => keys.includes(key))),
				};
	const clearChosen = () => setChosenKeys(noChosen);

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
			{selectionActions !== undefined && (
				<SelectionBar
					rows={chosenRows}
					actions={selectionActions}
					onClear={clearChosen}
					className={classNames?.selection}
				/>
			)}
			{/*
			 * Only the table waits, and only the records inside it: the pages under it are not records
			 * that have to arrive again, so they are left out of both the box and the ring.
			 */}
			<LumoTable.Root
				size={size}
				variant={variant}
				hoverable={hoverable && wait === null}
				layout={layout}
				waiting={wait === 'refreshing'}
				aria-busy={wait !== null || undefined}
				className={cn(className, classNames?.root)}
			>
				<LumoTable.Header className={classNames?.header}>
					<LumoTable.Row className={classNames?.row}>
						{choosable !== undefined && (
							<LumoTable.SelectionHead selection={choosable} fixed="start" />
						)}
						{headed.map(({ column, sort: columnSort, onSort }) => (
							<LumoTable.Head
								key={column.key}
								align={column.align}
								fixed={column.fixed}
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
								fixed="end"
								style={{ width: actionsWidth }}
								className={cn(classNames?.head, classNames?.actions)}
							/>
						)}
					</LumoTable.Row>
				</LumoTable.Header>
				<LumoTable.Body aria-hidden={wait === 'opening' || undefined} className={classNames?.body}>
					{wait === 'opening' ? (
						Array.from({ length: skeletonCount }, (_, index) => (
							<LumoTable.Row key={index} className={classNames?.row}>
								{choosable !== undefined && (
									<LumoTable.Cell
										align="start"
										fixed="start"
										className={cn(classNames?.cell, 'w-10')}
									>
										<LumoSkeleton className="size-4 rounded-sm" />
									</LumoTable.Cell>
								)}
								{visible.map((column) => (
									<LumoTable.Cell
										key={column.key}
										align={column.align}
										fixed={column.fixed}
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
										fixed="end"
										style={{ width: actionsWidth }}
										className={cn(classNames?.cell, classNames?.actions)}
									>
										<LumoSkeleton className={cn('ms-auto size-6', classNames?.skeleton)} />
									</LumoTable.Cell>
								)}
							</LumoTable.Row>
						))
					) : failure !== undefined || data.length === 0 ? (
						<LumoTable.Empty
							columns={visible.length + (hasActions ? 1 : 0) + (choosable === undefined ? 0 : 1)}
							className={classNames?.empty}
						>
							{notice}
						</LumoTable.Empty>
					) : (
						records.map(({ row, key, items }, index) => (
							<LumoTable.Row
								key={key}
								data-selected={chosen.includes(key) ? '' : undefined}
								data-menu-open={menuRow === key ? '' : undefined}
								className={cn(classNames?.row, hasActions && 'group/row')}
								onContextMenu={
									items.length === 0
										? undefined
										: (event) => {
												event.preventDefault();
												openRowMenu({ row, anchor: anchorOf(event) });
											}
								}
							>
								{choosable !== undefined && (
									<LumoTable.SelectionCell
										selection={choosable}
										value={key}
										label={rowLabel?.(row)}
										fixed="start"
									/>
								)}
								{headed.map(({ column, sort: columnSort }, columnIndex) => (
									<LumoTable.Cell
										key={column.key}
										id={columnIndex === 0 ? cellId(index) : undefined}
										align={column.align}
										fixed={column.fixed}
										sort={columnSort}
										className={cn(classNames?.cell, column.className)}
									>
										{column.cell(row)}
									</LumoTable.Cell>
								))}
								{hasActions && (
									<LumoTable.Cell
										align="end"
										fixed="end"
										style={{ width: actionsWidth }}
										className={cn(classNames?.cell, classNames?.actions)}
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
													onClick={(event) =>
														toggleRowMenu({ row, key, anchor: event.currentTarget })
													}
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
