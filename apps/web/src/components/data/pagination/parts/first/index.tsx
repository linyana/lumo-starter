import { ChevronsLeft } from 'lucide-react';
import { usePagination } from '../context';
import { heldBy, itemOf, type ItemProps } from '../page';

export type PaginationFirstProps = ItemProps;

/** The first page, for a list too long to walk back through a page at a time. */
export function PaginationFirst({ className, children, ...props }: PaginationFirstProps) {
	const state = usePagination('PaginationFirst');
	const first = state.page <= 1;
	const held = heldBy({ state, edge: first });

	return (
		<button
			type="button"
			data-slot="pagination-first"
			data-size={state.size}
			data-disabled={first ? '' : undefined}
			aria-label={state.locale.first}
			disabled={held}
			onClick={() => state.go(1)}
			className={itemOf({ size: state.size, className })}
			{...props}
		>
			{children ?? <ChevronsLeft />}
		</button>
	);
}
