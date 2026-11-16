import { ChevronRight } from 'lucide-react';
import { usePagination } from '../context';
import { heldBy, itemOf, type ItemProps } from '../page';

export type PaginationNextProps = ItemProps;

/** One page on. Disabled on the last, for the same reason as `PaginationPrev`. */
export function PaginationNext({ className, children, ...props }: PaginationNextProps) {
	const state = usePagination('PaginationNext');
	const last = state.page >= state.pageCount;
	const held = heldBy({ state, edge: last });

	return (
		<button
			type="button"
			data-slot="pagination-next"
			data-size={state.size}
			data-disabled={last ? '' : undefined}
			aria-label={state.locale.next}
			disabled={held}
			onClick={() => state.go(state.page + 1)}
			className={itemOf({ size: state.size, className })}
			{...props}
		>
			{children ?? <ChevronRight />}
		</button>
	);
}
