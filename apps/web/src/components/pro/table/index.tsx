import { Ellipsis } from 'lucide-react';
import { useState } from 'react';
import { LumoSkeleton } from '@/components/ui/skeleton';
import { LumoTable, type TableSort as AriaSort } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Button } from '../button';
import { ContextMenu, type ContextMenuAnchor } from '../context-menu';
import type { TableProps, TableSort } from './types';

export type {
	TableColumn,
	TableFilterProps,
	TableOptionsFilter,
	TableOrder,
	TableProps,
	TableSlots,
	TableSort,
	TableTextFilter,
} from './types';

/** What the column the table draws itself is called when the caller does not name the press. */
const actions = 'Actions';

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
	rows,
	rowKey,
	sort,
	onSortChange,
	rowActions,
	rowActionsLabel,
	size = 'md',
	variant = 'borderless',
	hoverable = true,
	loading = false,
	skeletonRows = 5,
	empty,
	className,
	classNames,
}: TableProps<Row, Key>) => {
	// The record the open menu is about, and the place it opened at. It is the table's only state,
	// because a menu is opened and closed by the reader rather than by the records handed in.
	const [menu, setMenu] = useState<{ row: Row; key: string; anchor: ContextMenuAnchor } | null>(
		null,
	);

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
		sort: column.sortKey === undefined ? undefined : ariaSortOf({ sortKey: column.sortKey, sort }),
		onSort: sortPressOf({ sortKey: column.sortKey, onSortChange }),
	}));

	// The column is worth a strip of its own only while some record has something to offer: a reader
	// who may not act on any row is not shown a column of nothing. One pass over the rows builds what
	// each of them offers — the row's own "..." and the menu under a right press draw the same list.
	const records = rows.map((row) => ({ row, key: rowKey(row), items: actionsOf(row) }));
	const withActions =
		rowActions !== undefined && (loading || records.some((record) => record.items.length > 0));

	return (
		<>
			<LumoTable.Root
				size={size}
				variant={variant}
				hoverable={hoverable && !loading}
				aria-busy={loading || undefined}
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
								align="end"
								aria-label={actions}
								className={cn(classNames?.head, 'w-px', classNames?.actions)}
							/>
						)}
					</LumoTable.Row>
				</LumoTable.Header>
				<LumoTable.Body aria-hidden={loading || undefined} className={classNames?.body}>
					{loading ? (
						Array.from({ length: skeletonRows }, (_, index) => (
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
					) : rows.length === 0 ? (
						<LumoTable.Empty
							columns={columns.length + (withActions ? 1 : 0)}
							className={classNames?.empty}
						>
							{empty}
						</LumoTable.Empty>
					) : (
						records.map(({ row, key, items }) => (
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
								{headed.map(({ column, sort: columnSort }) => (
									<LumoTable.Cell
										key={column.key}
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
													aria-label={rowActionsLabel?.(row) ?? actions}
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

			<ContextMenu
				anchor={menu?.anchor ?? null}
				items={menu === null ? [] : actionsOf(menu.row)}
				onClose={() => setMenu(null)}
			/>
		</>
	);
};
