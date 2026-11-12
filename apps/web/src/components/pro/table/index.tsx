import { Ellipsis, RotateCcw } from 'lucide-react';
import { useId, useState } from 'react';
import { LumoSkeleton } from '@/components/ui/skeleton';
import { LumoTable, type TableSort as AriaSort } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Button } from '../button';
import { ContextMenu, type ContextMenuAnchor } from '../context-menu';
import { Pagination, type PaginationProps } from '../pagination';
import { Spinner } from '../spinner';
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

const actions = 'Actions';

const noRecords: never[] = [];

const idOf = (row: unknown) => String((row as { id: unknown }).id);

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
	const [menu, setMenu] = useState<{ row: Row; key: string; anchor: ContextMenuAnchor } | null>(
		null,
	);

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

	const openMenu = ({ row, anchor }: { row: Row; anchor: ContextMenuAnchor }) => {
		if (actionsOf(row).length === 0) return;
		setMenu({ row, key: rowKey(row), anchor });
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
								data-menu-open={menu?.key === key ? '' : undefined}
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
												openMenu({
													row,
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
				items={menu === null ? [] : actionsOf(menu.row)}
				onClose={() => setMenu(null)}
			/>
		</div>
	);
};
