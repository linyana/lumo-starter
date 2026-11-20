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

type OpenMenu = {
	anchor: ContextMenuAnchor;
	items: MenuEntry[];
	rowKey?: string;
};

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
		onPageSizeChange: list.setPageSize,
		busy: list.wait !== null,
	};
}

const rowActionReveal = cn(
	'inline-flex opacity-0 pointer-events-none transition-opacity duration-(--duration-state)',
	'group-hover/row:opacity-100 group-hover/row:pointer-events-auto',
	'group-has-[:focus-visible]/row:opacity-100 group-has-[:focus-visible]/row:pointer-events-auto',
);

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

const sortPress = {
	ascending: { label: 'Sort ascending', icon: <ArrowUp /> },
	descending: { label: 'Sort descending', icon: <ArrowDown /> },
	cleared: { label: 'Clear sorting', icon: <ArrowUpDown /> },
} as const;

/**
 * The column's whole cycle, drawn at once: a reader asks for the direction they want instead of pressing
 * through the ones between. The step the column already stands in is the one that stays unpressed.
 */
const sortSteps = ['ascending', 'descending', 'cleared'] as const;

type SortStep = (typeof sortSteps)[number];

/** Which step the column stands in. Every `aria-sort` but two is a column that is not sorted. */
function stepOf(sort: AriaSort | undefined): SortStep {
	return sort === 'ascending' || sort === 'descending' ? sort : 'cleared';
}

/** What a step asks the caller for, including the `undefined` that stops sorting the column. */
function sortOf(step: SortStep): AriaSort | undefined {
	return step === 'cleared' ? undefined : step;
}

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
		const applied = stepOf(sort);

		for (const step of sortSteps) {
			const { label, icon } = sortPress[step];

			items.push({
				label,
				icon,
				separatorBefore: step === 'cleared',
				disabled: step === applied,
				onClick: () => onSort(sortOf(step)),
			});
		}
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
					const glyphOnly = iconOnly === true && icon !== undefined;
					const look = {
						variant: glyphOnly ? ('ghost' as const) : ('outline' as const),
						size: glyphOnly ? ('icon' as const) : ('sm' as const),
						tone: destructive ? ('destructive' as const) : ('default' as const),
						icon,
						...button,
					};
					const words = glyphOnly ? <span className="sr-only">{label}</span> : label;
					const why = `${prefix}-blocked-${index}`;

					return reason === undefined ? (
						<Button key={index} {...look} onClick={() => onClick(chosen)}>
							{words}
						</Button>
					) : (
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

	const declaredOf = (row: Row) => rowActions?.(row) ?? noItems;
	const actionsOf = (row: Row) => filterAccess({ items: declaredOf(row), grant });

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
