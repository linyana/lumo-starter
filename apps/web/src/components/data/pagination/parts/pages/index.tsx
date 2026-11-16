import { cn } from '@/lib/utils';
import { usePagination } from '../context';
import { JUMP_STEP, PaginationEllipsis } from '../ellipsis';
import { PaginationPage } from '../page';

/**
 * Which numbers a run shows: the first and last pages, and the page in view with `siblings` on each
 * side. Everything between is one gap, however many pages it hides — a pagination that listed them
 * all would be a list of pages rather than a way through them. A run of exactly one is not a gap: a
 * single page is a box like any other, and hiding it would cost the reader a press to gain nothing.
 *
 * A gap says which way it lies, which is what its press needs: the ones before the page in view go
 * back, the ones after it go on.
 */
function pageList({ page, count, siblings }: { page: number; count: number; siblings: number }) {
	const near = siblings + 1;
	const nearEdge = (value: number) => value <= near || value > count - near;
	const shown = (value: number) => nearEdge(value) || Math.abs(value - page) <= siblings;

	const pages: { key: string; value?: number; direction?: 'prev' | 'next' }[] = [];
	let previous = 0;

	for (const value of Array.from({ length: count }, (_, index) => index + 1).filter(shown)) {
		const hidden = value - previous - 1;

		if (hidden === 1) {
			// The one page between the two runs is drawn rather than dotted over.
			pages.push({ key: `page-${previous + 1}`, value: previous + 1 });
		} else if (hidden > 1) {
			// The run of hidden pages between two numbers becomes one gap, named by the page it follows.
			pages.push({ key: `gap-${previous + 1}`, direction: value < page ? 'prev' : 'next' });
		}

		pages.push({ key: `page-${value}`, value });
		previous = value;
	}

	return pages;
}

export type PaginationPagesProps = {
	/** How many pages show on each side of the one in view. */
	siblings?: number;
	/** Merged last through `cn()`, on the box that holds the numbers. */
	className?: string;
};

/** The numbers, in a row, with the gaps between them — each gap a press that skips its run. */
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
