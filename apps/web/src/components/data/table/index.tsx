import { filterAccess, permits } from '@lumo/shared';
import { ArrowDown, ArrowUp, ArrowUpDown, Ellipsis, ListFilter, RotateCcw } from 'lucide-react';
import { Fragment, useId, useState, type MouseEvent } from 'react';
import { Pagination, type PaginationProps } from '@/components/data/pagination';
import { Skeleton } from '@/components/feedback/skeleton';
import { Button } from '@/components/form/button';
import { ActionBar } from '@/components/overlay/action-bar';
import { ContextMenu, type ContextMenuAnchor } from '@/components/overlay/context-menu';
import type { MenuEntry } from '@/components/overlay/menu';
import { Tooltip } from '@/components/overlay/tooltip';
import { cn } from '@/lib/utils';
import { useAccess } from '@/providers/access';
import {
	TableBody,
	TableCell,
	tableDensity,
	TableEmpty,
	TableHead,
	TableHeader,
	TableRoot,
	TableRow,
	TableSelectionCell,
	TableSelectionHead,
	type TableSort as AriaSort,
} from './parts';
import type {
	SelectionAction,
	SelectionChosen,
	TableColumn,
	TableFilterProps,
	TableList,
	TableProps,
	TableSort,
} from './types';

export type {
	SelectionAction,
	SelectionChosen,
	TableColumn,
	TableFilterProps,
	TableFixed,
	TableOrder,
	TableList,
	TableProps,
	TableSlots,
	TableSort,
} from '@/components/data/table/types';

const actions = 'Actions';

const noRecords: never[] = [];

const noItems: MenuEntry[] = [];

const noChosen: string[] = [];

const idOf = (row: unknown) => String((row as { id: unknown }).id);

/**
 * The menu the table has open, whichever half of it asked: the actions of a record from a right press
 * on its row, or a column's own from one on its title. One list, one place on the page.
 */
type OpenMenu = {
	anchor: ContextMenuAnchor;
	items: MenuEntry[];
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

/**
 * What a list says about the way through its records, as a `Pagination` takes it. The list's own page
 * size setter is handed over too, so a footer draws the size box without a screen naming it.
 */
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
		onPageSizeChange: list.setPageSize,
		// A read in the air holds the footer's presses: the rows are about to be replaced, so a press
		// would be aimed at a page the reader has not seen yet.
		busy: list.wait === 'refreshing',
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
}): MenuEntry[] {
	const items: MenuEntry[] = [];

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
 * What the table puts in the floating bar while records are chosen: how many on the start, the way back
 * beside them, and what can be done with them on the end. The list is the caller's minus what the session
 * is not granted, and an action the chosen records withhold is drawn unavailable with the reason on it
 * rather than dropped — the records are on the screen and the reader chose them, so "not these, because…"
 * is the answer, not silence.
 *
 * Each press is a `Button` drawn as the bar draws one — an outlined box for a word, a quiet glyph for an
 * icon alone — unless the press stated its own shape, in which case that is what is drawn.
 */
const SelectionBar = <Row,>({ rows, actions, onClear, className }: SelectionBarProps<Row>) => {
	const grant = useAccess();
	const prefix = useId();
	const offered = rows.length === 0 ? [] : filterAccess({ items: actions(rows), grant });
	const chosen: SelectionChosen<Row> = { rows, clear: onClear };

	return (
		<ActionBar visible={rows.length > 0} className={className}>
			<div className="flex items-center gap-2">
				<p aria-live="polite" className="text-sm font-medium">
					{rows.length === 1 ? '1 selected' : `${rows.length} selected`}
				</p>
				{/*
				 * The way out of the choice, not a thing done with it: the same button as the bar's own, in the
				 * quiet ink and one step down in type, so it reads as the count's aside rather than as something
				 * the records offer. The one pixel of padding on top is optical: a smaller word's ink sits a hair
				 * high in a box centred on the one beside it — its ascender tops line up while its baseline does
				 * not — and half that difference back is what puts the two on one line to the eye.
				 */}
				<Button
					variant="ghost"
					size="sm"
					className="pt-px text-xs text-muted-foreground"
					onClick={onClear}
				>
					Clear
				</Button>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				{offered.map((action, index) => {
					// The bar's own fields, taken out so that everything left — `variant`, `tone`, `size`, `className`,
					// `loading`, whatever else the button takes — is the button's and is spread on as it was stated.
					const {
						label,
						icon,
						iconOnly,
						destructive,
						blocked,
						onClick,
						access: _access,
						...button
					} = action;
					const reason = blocked?.(rows);
					// An icon alone is only a press once there is an icon to press: a wordless action is the one
					// thing the bar refuses to draw, because nothing in it would say what it does.
					const glyphOnly = iconOnly === true && icon !== undefined;
					// What the bar draws when the press has no opinion, and only then: this object is spread over, so
					// a screen stating its own `variant` or `tone` — a filled primary — is drawn as it asked.
					const look = {
						// A box drawn around one glyph is louder than the same box around a word, so the action that
						// gave up its words gives up the edge with them and stands as the icon alone.
						variant: glyphOnly ? ('ghost' as const) : ('outline' as const),
						size: glyphOnly ? ('icon' as const) : ('sm' as const),
						tone: destructive ? ('destructive' as const) : ('default' as const),
						icon,
						...button,
					};
					// The words stay in the button when the icon takes their place: the press keeps its name read
					// out, and loses only the room it took.
					const words = glyphOnly ? <span className="sr-only">{label}</span> : label;
					const why = `${prefix}-blocked-${index}`;

					return reason === undefined ? (
						<Button key={index} {...look} onClick={() => onClick(chosen)}>
							{words}
						</Button>
					) : (
						// The press keeps its name and its place and stops being a press. It stays focusable, so the
						// sentence is not hover-only, and it is drawn as it stands: a disabled button here keeps taking
						// the pointer, so the hint arrives on hover as well as on focus.
						<Fragment key={index}>
							<Tooltip content={reason}>
								<Button {...look} disabled focusableWhenDisabled aria-describedby={why}>
									{words}
								</Button>
							</Tooltip>
							<span id={why} className="sr-only">
								{reason}
							</span>
						</Fragment>
					);
				})}
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
	const pager = { ...pagerOf(list), ...pagination };
	const skeletonCount = skeletonRows ?? list?.pageSize ?? 5;

	const paging =
		failure === undefined &&
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
		<div data-slot="table-block" className={cn('relative min-w-0', tableDensity[size])}>
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
			<TableRoot
				size={size}
				variant={variant}
				hoverable={hoverable && wait === null}
				layout={layout}
				waiting={wait === 'refreshing'}
				aria-busy={wait !== null || undefined}
				className={cn(className, classNames?.root)}
			>
				<TableHeader className={classNames?.header}>
					<TableRow className={classNames?.row}>
						{choosable !== undefined && <TableSelectionHead selection={choosable} fixed="start" />}
						{headed.map(({ column, sort: columnSort, onSort }) => (
							<TableHead
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
							</TableHead>
						))}
						{hasActions && (
							<TableHead
								id={actionsId}
								align="end"
								aria-label={actions}
								fixed="end"
								style={{ width: actionsWidth }}
								className={cn(classNames?.head, classNames?.actions)}
							/>
						)}
					</TableRow>
				</TableHeader>
				<TableBody aria-hidden={wait === 'opening' || undefined} className={classNames?.body}>
					{wait === 'opening' ? (
						Array.from({ length: skeletonCount }, (_, index) => (
							<TableRow key={index} className={classNames?.row}>
								{choosable !== undefined && (
									<TableCell align="start" fixed="start" className={cn(classNames?.cell, 'w-10')}>
										<Skeleton className="size-4 rounded-sm" />
									</TableCell>
								)}
								{visible.map((column) => (
									<TableCell
										key={column.key}
										align={column.align}
										fixed={column.fixed}
										className={cn(classNames?.cell, column.className)}
									>
										<Skeleton
											className={cn(
												'h-5 w-3/4',
												column.align === 'center' && 'mx-auto',
												column.align === 'end' && 'ms-auto',
												classNames?.skeleton,
											)}
										/>
									</TableCell>
								))}
								{hasActions && (
									<TableCell
										align="end"
										fixed="end"
										style={{ width: actionsWidth }}
										className={cn(classNames?.cell, classNames?.actions)}
									>
										<Skeleton className={cn('ms-auto size-6', classNames?.skeleton)} />
									</TableCell>
								)}
							</TableRow>
						))
					) : failure !== undefined || data.length === 0 ? (
						<TableEmpty
							columns={visible.length + (hasActions ? 1 : 0) + (choosable === undefined ? 0 : 1)}
							className={classNames?.empty}
						>
							{notice}
						</TableEmpty>
					) : (
						records.map(({ row, key, items }, index) => (
							<TableRow
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
									<TableSelectionCell
										selection={choosable}
										value={key}
										label={rowLabel?.(row)}
										fixed="start"
									/>
								)}
								{headed.map(({ column, sort: columnSort }, columnIndex) => (
									<TableCell
										key={column.key}
										id={columnIndex === 0 ? cellId(index) : undefined}
										align={column.align}
										fixed={column.fixed}
										sort={columnSort}
										className={cn(classNames?.cell, column.className)}
									>
										{column.cell(row)}
									</TableCell>
								))}
								{hasActions && (
									<TableCell
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
									</TableCell>
								)}
							</TableRow>
						))
					)}
				</TableBody>
			</TableRoot>

			{paging && (
				<Pagination
					{...pager}
					page={pager.page ?? 1}
					size={pager.size ?? size}
					range={pager.range ?? true}
					// The footer is outside the frame the table's own insets are set on, so the count is inset here by
					// the same measurement it would be under the first column. The end is not: the last control of the
					// row ends where the table ends, so the two share one edge down the side of the block.
					className={cn('pt-(--cell-py) ps-(--cell-px)', pager.className, classNames?.footer)}
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
