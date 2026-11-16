import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type TableExpandedRowProps = Omit<ComponentProps<'tr'>, 'children'> & {
	/** How many columns the panel reaches across: the whole row. */
	columns: number;
	/** How deep the record above it sits, so the panel opens under the name it belongs to. */
	depth?: number;
	children: ReactNode;
	/** Merged last through `cn()`, on the cell. */
	className?: string;
};

/**
 * The panel a record opens into. It is a row and not a box floating under one, so the table keeps its
 * columns and a reader keeps the header they were reading. Render it under the record it belongs to,
 * where the table would otherwise have gone on with the next one.
 */
export function TableExpandedRow({
	columns,
	depth = 1,
	className,
	children,
	...props
}: TableExpandedRowProps) {
	return (
		<tr data-slot="table-expanded" style={{ '--table-depth': depth } as CSSProperties} {...props}>
			<td
				colSpan={columns}
				className={cn(
					'border-b bg-muted/40 py-(--cell-py) pe-(--cell-px)',
					'ps-[calc(var(--cell-px)+var(--table-depth,0)*var(--spacing)*6)]',
					className,
				)}
			>
				{children}
			</td>
		</tr>
	);
}
