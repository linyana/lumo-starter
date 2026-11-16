import { ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { usePagination } from '../context';
import { itemOf } from '../page';
import { paginationItemVariants } from '../root';

export /**
 * How many pages one press on a gap skips: far enough to save a walk through the run it hides, near
 * enough that the reader keeps their place afterwards — the number antd has always used.
 */
const JUMP_STEP = 5;

export type PaginationEllipsisProps = Omit<ComponentProps<'span'>, 'children'> & {
	/** Replaces the three dots. */
	children?: ReactNode;
	/**
	 * Where the gap goes. Given, the gap is a press that skips the pages it stands for, and the dots
	 * become two chevrons pointing that way — the way a long list is crossed without walking it.
	 */
	onJump?: () => void;
	/** Which way that press is: the chevron drawn, and the sentence the press is named with. */
	direction?: 'prev' | 'next';
	/** Merged last through `cn()`. */
	className?: string;
};

/**
 * A gap between two numbers: the pages that are not worth a box. Decoration by default — it is
 * `aria-hidden`, so a reader hears the numbers on either side of it and nothing else. Given `onJump`
 * it is a control instead: one press skips the run, and the dots give way to two chevrons under the
 * pointer, which is how it says there is something to press without a box for every hidden page.
 */
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
			aria-label={named.replace('{count}', String(JUMP_STEP))}
			disabled={state.busy}
			onClick={onJump}
			className={cn(itemOf({ size: state.size, className }), 'group')}
			// The same attributes on the element that can take a press: a gap that jumps is a button.
			{...(props as ComponentProps<'button'>)}
		>
			{/* Both faces hold the same box, so the gap does not breathe as the pointer arrives. */}
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
