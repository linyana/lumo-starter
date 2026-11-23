import type { ComponentProps } from 'react';
import { pressable, stateLayer } from '@/lib/control';
import { cn } from '@/lib/utils';
import { usePagination, type PaginationState } from '../context';
import { paginationItemVariants } from '../root';

const paginationItemStates = cn(
	'relative cursor-pointer text-muted-foreground',
	'hover:text-foreground',
	stateLayer,
	pressable,
	'data-active:font-medium data-active:text-foreground',
	'data-active:after:opacity-(--state-layer-hover-opacity)',
	'data-active:hover:after:opacity-(--state-layer-selected-hover-opacity)',
	'data-disabled:pointer-events-none data-disabled:opacity-40',
);

export function itemOf({ size, className }: { size: PaginationState['size']; className?: string }) {
	return cn(paginationItemVariants({ size }), paginationItemStates, className);
}

export function heldBy({
	state,
	edge = false,
}: {
	state: PaginationState;
	edge?: boolean;
}): boolean {
	return state.busy || edge;
}

export type ItemProps = Omit<ComponentProps<'button'>, 'type'> & {
	className?: string;
};

export type PaginationPageProps = ItemProps & { value: number };

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
