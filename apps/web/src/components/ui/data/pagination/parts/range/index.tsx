import pluralize from 'pluralize';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { usePagination } from '../context';

const rangeWording = { leading: 'Showing', trailing: 'from' };

export type PaginationRangeProps = Omit<ComponentProps<'span'>, 'children'>;

export function PaginationRange({ className, ...props }: PaginationRangeProps) {
	const state = usePagination('PaginationRange');
	const { page, pageCount, total, pageSize, items } = state;
	const { leading, trailing } = rangeWording;

	let text: string;
	if (total === undefined) {
		text = `${page.toLocaleString()} / ${pageCount.toLocaleString()}`;
	} else if (total === 0) {
		text = `${leading} 0 ${trailing} 0 ${pluralize(items, 0)}`;
	} else {
		const size = Math.max(1, pageSize ?? Math.ceil(total / pageCount));
		const from = (page - 1) * size + 1;
		const to = Math.min(page * size, total);
		text = `${leading} ${from.toLocaleString()} - ${to.toLocaleString()} ${trailing} ${total.toLocaleString()} ${pluralize(items, total)}`;
	}

	return (
		<span
			data-slot="pagination-range"
			data-size={state.size}
			className={cn('text-sm text-muted-foreground tabular-nums', className)}
			{...props}
		>
			{text}
		</span>
	);
}
