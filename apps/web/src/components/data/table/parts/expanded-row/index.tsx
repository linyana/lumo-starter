import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type TableExpandedRowProps = Omit<ComponentProps<'tr'>, 'children'> & {
	columns: number;
	depth?: number;
	children: ReactNode;
	className?: string;
};

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
