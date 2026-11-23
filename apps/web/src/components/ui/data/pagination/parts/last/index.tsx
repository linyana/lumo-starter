import { ChevronsRight } from 'lucide-react';
import { usePagination } from '../context';
import { heldBy, itemOf, type ItemProps } from '../page';

export type PaginationLastProps = ItemProps;

export function PaginationLast({ className, children, ...props }: PaginationLastProps) {
	const state = usePagination('PaginationLast');
	const last = state.page >= state.pageCount;
	const held = heldBy({ state, edge: last });

	return (
		<button
			type="button"
			data-slot="pagination-last"
			data-size={state.size}
			data-disabled={last ? '' : undefined}
			aria-label={state.locale.last}
			disabled={held}
			onClick={() => state.go(state.pageCount)}
			className={itemOf({ size: state.size, className })}
			{...props}
		>
			{children ?? <ChevronsRight />}
		</button>
	);
}
