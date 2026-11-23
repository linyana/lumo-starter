import { ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { usePagination } from '../context';
import { itemOf } from '../page';
import { paginationItemVariants } from '../root';

export const JUMP_STEP = 5;

export type PaginationEllipsisProps = Omit<ComponentProps<'span'>, 'children'> & {
	children?: ReactNode;
	onJump?: () => void;
	direction?: 'prev' | 'next';
	className?: string;
};

export function PaginationEllipsis({
	className,
	children,
	onJump,
	direction = 'next',
	...props
}: PaginationEllipsisProps) {
	const state = usePagination('PaginationEllipsis');
	const face = children ?? <MoreHorizontal />;
	const named = direction === 'prev' ? state.locale.previousPages : state.locale.nextPages;

	if (onJump === undefined) {
		return (
			<span
				data-slot="pagination-ellipsis"
				data-size={state.size}
				aria-hidden
				className={cn(
					paginationItemVariants({ size: state.size }),
					'text-muted-foreground',
					className,
				)}
				{...props}
			>
				{face}
			</span>
		);
	}

	return (
		<button
			type="button"
			data-slot="pagination-ellipsis"
			data-size={state.size}
			data-disabled={state.busy ? '' : undefined}
			aria-label={named.replace('{count}', String(JUMP_STEP))}
			disabled={state.busy}
			onClick={onJump}
			className={cn(itemOf({ size: state.size, className }), 'group')}
			{...(props as ComponentProps<'button'>)}
		>
			<span
				aria-hidden
				className="inline-flex items-center justify-center opacity-100 transition-opacity duration-(--duration-state) group-hover:opacity-0 group-focus-visible:opacity-0"
			>
				{face}
			</span>
			<span
				aria-hidden
				className="absolute inline-flex items-center justify-center opacity-0 transition-opacity duration-(--duration-state) group-hover:opacity-100 group-focus-visible:opacity-100"
			>
				{direction === 'prev' ? <ChevronsLeft /> : <ChevronsRight />}
			</span>
		</button>
	);
}
