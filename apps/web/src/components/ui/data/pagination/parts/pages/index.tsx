import { cn } from '@/lib/utils';
import { usePagination } from '../context';
import { JUMP_STEP, PaginationEllipsis } from '../ellipsis';
import { PaginationPage } from '../page';

function pageList({ page, count, siblings }: { page: number; count: number; siblings: number }) {
	const near = siblings + 1;
	const nearEdge = (value: number) => value <= near || value > count - near;
	const shown = (value: number) => nearEdge(value) || Math.abs(value - page) <= siblings;

	const pages: { key: string; value?: number; direction?: 'prev' | 'next' }[] = [];
	let previous = 0;

	for (const value of Array.from({ length: count }, (_, index) => index + 1).filter(shown)) {
		const hidden = value - previous - 1;

		if (hidden === 1) {
			pages.push({ key: `page-${previous + 1}`, value: previous + 1 });
		} else if (hidden > 1) {
			pages.push({ key: `gap-${previous + 1}`, direction: value < page ? 'prev' : 'next' });
		}

		pages.push({ key: `page-${value}`, value });
		previous = value;
	}

	return pages;
}

export type PaginationPagesProps = {
	siblings?: number;
	className?: string;
};

export function PaginationPages({ siblings = 1, className }: PaginationPagesProps) {
	const state = usePagination('PaginationPages');

	return (
		<span data-slot="pagination-pages" className={cn('flex items-center gap-1', className)}>
			{pageList({ page: state.page, count: state.pageCount, siblings }).map(
				({ key, value, direction }) =>
					value === undefined ? (
						<PaginationEllipsis
							key={key}
							direction={direction}
							onJump={() => state.go(state.page + (direction === 'prev' ? -JUMP_STEP : JUMP_STEP))}
						/>
					) : (
						<PaginationPage key={key} value={value} />
					),
			)}
		</span>
	);
}
