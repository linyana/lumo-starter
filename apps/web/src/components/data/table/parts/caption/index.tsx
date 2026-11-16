import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type TableCaptionProps = ComponentProps<'caption'>;

/** What the table is, for a reader who has not been told by the page around it. */
export function TableCaption({ className, ...props }: TableCaptionProps) {
	return (
		<caption
			data-slot="table-caption"
			className={cn('px-(--cell-px) py-(--cell-py) text-sm text-muted-foreground', className)}
			{...props}
		/>
	);
}
