import type { ComponentProps } from 'react';
import { stateLayer } from '@/lib/control';
import { cn } from '@/lib/utils';
import { usePagination, type PaginationState } from '../context';
import { paginationItemVariants } from '../root';

/**
 * What a part that can be pressed adds to that box. The page in view keeps the tint the pointer
 * leaves behind instead of filling, which is how a chosen row in `Nav` says it is current: a footer
 * of solid chips would outweigh the records it pages through.
 */
const paginationItemStates = cn(
	'relative cursor-pointer text-muted-foreground',
	'hover:text-foreground',
	stateLayer,
	'data-active:font-medium data-active:text-foreground',
	'data-active:after:opacity-(--state-layer-hover-opacity)',
	'data-active:hover:after:opacity-(--state-layer-selected-hover-opacity)',
	'data-disabled:pointer-events-none data-disabled:opacity-40',
);

export function itemOf({ size, className }: { size: PaginationState['size']; className?: string }) {
	return cn(paginationItemVariants({ size }), paginationItemStates, className);
}

export /**
 * Whether a part takes a press. A read in the air holds every one of them, and each part holds itself
 * on the edge it cannot go past — the two reasons a control looks dead, told apart by nothing a reader
 * has to know.
 */
function heldBy({ state, edge = false }: { state: PaginationState; edge?: boolean }): boolean {
	return state.busy || edge;
}

export type ItemProps = Omit<ComponentProps<'button'>, 'type'> & {
	/** Merged last through `cn()`. */
	className?: string;
};

export type PaginationPageProps = ItemProps & { value: number };

/** One page. Drawn by `PaginationPages`, and usable on its own for a window of your own making. */
export function PaginationPage({ value, className, children, ...props }: PaginationPageProps) {
	const state = usePagination('PaginationPage');
	const active = state.page === value;
	const held = heldBy({ state });

	return (
		<button
			type="button"
			data-slot="pagination-page"
			data-size={state.size}
			data-active={active ? '' : undefined}
			data-disabled={held ? '' : undefined}
			aria-current={active ? 'page' : undefined}
			aria-label={`${state.locale.page} ${value}`}
			disabled={held}
			onClick={() => state.go(value)}
			className={itemOf({ size: state.size, className })}
			{...props}
		>
			{children ?? value}
		</button>
	);
}
