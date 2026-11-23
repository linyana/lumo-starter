import { useState, type ComponentProps, type FocusEvent } from 'react';
import { inputVariants } from '@/components/ui/form/input';
import { cn } from '@/lib/utils';
import { usePagination } from '../context';

export type PaginationJumpProps = Omit<
	ComponentProps<'input'>,
	'value' | 'onChange' | 'size' | 'type'
> & {
	className?: string;
};

export function PaginationJump({ className, ...props }: PaginationJumpProps) {
	const state = usePagination('PaginationJump');
	const [draft, setDraft] = useState('');

	const ask = () => {
		const value = Number(draft.trim());
		if (Number.isInteger(value) && value > 0) state.go(value);
		setDraft('');
	};

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
