import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type TableFooterProps = ComponentProps<'tfoot'>;

export function TableFooter({ className, ...props }: TableFooterProps) {
	return (
		<tfoot
			data-slot="table-footer"
			className={cn(
				'bg-table-head font-medium [&>tr:first-child>*]:border-t [&>tr:last-child>*]:border-b-0',
				className,
			)}
			{...props}
		/>
	);
}
