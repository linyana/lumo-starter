import type { ComponentProps, ReactNode } from 'react';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';

export type TableEmptyProps = Omit<ComponentProps<'td'>, 'colSpan'> & {
	columns: number;
	icon?: ReactNode;
};

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
