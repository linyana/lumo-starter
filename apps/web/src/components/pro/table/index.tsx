import { LumoTable } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { TableProps } from './types';

/** Records in columns: the column names once, one row per record, and the empty row when there is none. */
export const Table = <Row,>({
	columns,
	rows,
	rowKey,
	size = 'md',
	variant = 'borderless',
	hoverable = true,
	loading = false,
	empty,
	className,
	classNames,
}: TableProps<Row>) => (
	<LumoTable.Root
		size={size}
		variant={variant}
		hoverable={hoverable}
		loading={loading}
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
		<LumoTable.Body className={classNames?.body}>
			{rows.length === 0 ? (
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
