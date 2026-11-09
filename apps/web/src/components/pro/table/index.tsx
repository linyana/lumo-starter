import { LumoSkeleton } from '@/components/ui/skeleton';
import { LumoTable } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { TableProps } from './types';

export type { TableColumn, TableProps, TableSlots } from './types';

/** Records in columns: the column names once, one row per record, and the empty row when there is none. */
export const Table = <Row,>({
	columns,
	rows,
	rowKey,
	size = 'md',
	variant = 'borderless',
	hoverable = true,
	loading = false,
	skeletonRows = 5,
	empty,
	className,
	classNames,
}: TableProps<Row>) => (
	<LumoTable.Root
		size={size}
		variant={variant}
		hoverable={hoverable && !loading}
		aria-busy={loading || undefined}
		className={cn(className, classNames?.root)}
	>
		<LumoTable.Header className={classNames?.header}>
			<LumoTable.Row className={classNames?.row}>
				{columns.map((column) => (
					<LumoTable.Head
						key={column.key}
						align={column.align}
						style={column.width === undefined ? undefined : { width: column.width }}
						className={cn(classNames?.head, column.className)}
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
						{columns.map((column) => (
							<LumoTable.Cell
								key={column.key}
								align={column.align}
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
