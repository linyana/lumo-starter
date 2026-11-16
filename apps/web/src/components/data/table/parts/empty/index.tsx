import type { ComponentProps, ReactNode } from 'react';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';

export type TableEmptyProps = Omit<ComponentProps<'td'>, 'colSpan'> & {
	/** How many columns the row has to reach across to be the width of the table. */
	columns: number;
	/** A glyph over the sentence. Sized from the text around it, like every other slot. */
	icon?: ReactNode;
};

/**
 * The row a table shows when it has none. It is a row rather than a floating box, so it keeps the
 * columns — a table that emptied itself into a paragraph would take the header away from the reader
 * at the moment they most want to know what was supposed to be there.
 */
export function TableEmpty({ columns, icon, className, children, ...props }: TableEmptyProps) {
	return (
		<tr data-slot="table-empty">
			<td
				data-slot="table-empty-cell"
				colSpan={columns}
				className={cn('border-b px-(--cell-px) py-12 text-center text-muted-foreground', className)}
				{...props}
			>
				<div
					data-slot="table-empty-content"
					className="mx-auto flex max-w-sm flex-col items-center gap-2"
				>
					{icon !== undefined && (
						<span data-slot="table-empty-icon" className={cn('text-2xl', iconSlot)} aria-hidden>
							{icon}
						</span>
					)}
					{children}
				</div>
			</td>
		</tr>
	);
}
