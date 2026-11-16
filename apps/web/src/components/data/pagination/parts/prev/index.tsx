import { ChevronLeft } from 'lucide-react';
import { usePagination } from '../context';
import { heldBy, itemOf, type ItemProps } from '../page';

export type PaginationPrevProps = ItemProps;

/** One page back. Disabled on the first page, where there is nowhere to go. */
export function PaginationPrev({ className, children, ...props }: PaginationPrevProps) {
	const state = usePagination('PaginationPrev');
	const held = heldBy({ state, edge: state.page <= 1 });

	return (
		<button
			type="button"
			data-slot="pagination-prev"
			data-size={state.size}
			data-disabled={state.page <= 1 ? '' : undefined}
			aria-label={state.locale.previous}
			disabled={held}
			onClick={() => state.go(state.page - 1)}
			className={itemOf({ size: state.size, className })}
			{...props}
		>
			{children ?? <ChevronLeft />}
		</button>
	);
}
