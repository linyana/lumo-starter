import { useState, type ComponentProps, type FocusEvent } from 'react';
import { inputVariants } from '@/components/form/input';
import { cn } from '@/lib/utils';
import { usePagination } from '../context';

export type PaginationJumpProps = Omit<
	ComponentProps<'input'>,
	'value' | 'onChange' | 'size' | 'type'
> & {
	/** Merged last through `cn()`, on the box. */
	className?: string;
};

/**
 * A page asked for by number: the box is empty until something is typed into it, and empty again once
 * the number has been taken, so it is only ever the page the reader is asking for and never a second
 * place the page in view is written. Enter takes it, and so does leaving the box; Escape, or something
 * that is not a page, empties it. For the list long enough that the numbers beside the one in view are
 * never the one the reader wants.
 *
 * The box is the library's field, without the cross: what it holds is typed once and handed over, so
 * there is no value to empty and nothing for a browser to fill — which is why it is not `Input`.
 */
export function PaginationJump({ className, ...props }: PaginationJumpProps) {
	const state = usePagination('PaginationJump');
	const [draft, setDraft] = useState('');

	const ask = () => {
		const value = Number(draft.trim());
		// Nothing typed, or nothing that is a page: the box goes back to empty either way. The frame is
		// what clamps a number past the last page, so the press has one reader of the range, not two.
		if (Number.isInteger(value) && value > 0) state.go(value);
		setDraft('');
	};

	/**
	 * Leaving the box is a press too: a reader who typed 12 and moved on meant 12. What is not a press
	 * is moving to another control of this row — an arrow, a number, a gap, the size box — because that
	 * control is a navigation of its own, and taking both would ask for two pages at once.
	 */
	const leave = (event: FocusEvent<HTMLInputElement>) => {
		const next = event.relatedTarget;
		if (next instanceof HTMLElement && next.closest('[data-slot="pagination"]') !== null) {
			setDraft('');
			return;
		}

		ask();
	};

	return (
		<label className="inline-flex items-center gap-1.5 whitespace-nowrap">
			<span className="text-sm text-muted-foreground">{state.locale.goTo}</span>
			<input
				type="text"
				inputMode="numeric"
				data-slot="pagination-jump"
				data-size={state.size}
				value={draft}
				disabled={state.busy}
				onFocus={(event) => event.currentTarget.select()}
				onChange={(event) => setDraft(event.target.value)}
				onKeyDown={(event) => {
					if (event.key === 'Enter') {
						event.preventDefault();
						ask();
					}
					if (event.key === 'Escape') {
						event.preventDefault();
						setDraft('');
					}
				}}
				onBlur={leave}
				className={cn(
					inputVariants({ size: state.size }),
					'w-14 px-1 text-center tabular-nums',
					className,
				)}
				{...props}
			/>
			<span className="text-sm text-muted-foreground">{state.locale.page}</span>
		</label>
	);
}
