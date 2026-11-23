import type { ComponentProps, CSSProperties } from 'react';
import { tv } from 'tailwind-variants';
import { cn } from '@/lib/utils';

export const tableRowVariants = tv({
	base: ['data-disabled:pointer-events-none data-disabled:opacity-50'],
});

export type TableRowProps = ComponentProps<'tr'> & {
	depth?: number;
};

export function TableRow({ depth, className, style, ...props }: TableRowProps) {
	return (
		<tr
			data-slot="table-row"
			data-depth={depth}
			style={depth === undefined ? style : ({ '--table-depth': depth, ...style } as CSSProperties)}
			className={cn(tableRowVariants(), className)}
			{...props}
		/>
	);
}

export const rowCellWash = cn(
	'transition-colors duration-(--duration-state)',
	'[[data-slot=table-container][data-hoverable=true]>table>tbody>tr:not([data-selected]):hover>&]:bg-row-hover',
	'[tr[data-menu-open]>&]:bg-row-hover',
	'[tr[data-selected]>&]:bg-row-selected',
	'[[data-slot=table-container][data-hoverable=true]>table>tbody>tr[data-selected]:hover>&]:bg-row-selected-hover',
);
