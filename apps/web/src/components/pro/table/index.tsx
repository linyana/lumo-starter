import { LumoSkeleton } from '@/components/ui/skeleton';
import { LumoTable, type TableSort as AriaSort } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { TableProps, TableSort } from './types';

export type { TableColumn, TableOrder, TableProps, TableSlots, TableSort } from './types';

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
 */
export const Table = <Row, Key extends string = string>({
	columns,
	rows,
	rowKey,
	sort,
	onSortChange,
	size = 'md',
	variant = 'borderless',
	hoverable = true,
	loading = false,
	skeletonRows = 5,
	empty,
	className,
	classNames,
}: TableProps<Row, Key>) => {
	// One pass over the columns: a title, its arrow and the press it reports are three facts about
	// the same column and the cells have to shade with the same answer.
	const headed = columns.map((column) => ({
		column,
		sort: column.sortKey === undefined ? undefined : ariaSortOf({ sortKey: column.sortKey, sort }),
		onSort: sortPressOf({ sortKey: column.sortKey, onSortChange }),
	}));

	return (
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
						>
							{column.header}
						</LumoTable.Head>
					))}
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
						</LumoTable.Row>
					))
				) : rows.length === 0 ? (
					<LumoTable.Empty columns={columns.length} className={classNames?.empty}>
						{empty}
					</LumoTable.Empty>
				) : (
					rows.map((row) => (
						<LumoTable.Row key={rowKey(row)} className={classNames?.row}>
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
						</LumoTable.Row>
					))
				)}
			</LumoTable.Body>
		</LumoTable.Root>
	);
};
