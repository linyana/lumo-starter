import pluralize from 'pluralize';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { usePagination } from '../context';

/** The one word the range is written with, whatever the noun is: `Showing`, `from`. */
const rangeWording = { leading: 'Showing', trailing: 'from' };

export type PaginationRangeProps = Omit<ComponentProps<'span'>, 'children'>;

/**
 * What the page holds out of everything: `Showing 21 - 40 from 240 items` when the total is known,
 * `3 / 12` when only the page count is. It is the whole story in one line, which is what a narrow
 * screen shows in place of the numbers. The noun is the caller's — `items` — and its plural is the
 * only thing this part decides on its own.
 */
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
		// A caller that knows the total and the page count but not the size still gets a range: the
		// two together are the size.
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
