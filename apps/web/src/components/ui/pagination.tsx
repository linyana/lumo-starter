import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	MoreHorizontal,
} from 'lucide-react';
import pluralize from 'pluralize';
import {
	createContext,
	use,
	useMemo,
	useState,
	type ComponentProps,
	type FocusEvent,
	type ReactNode,
} from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { clampPage, pageCountOf, PAGE_SIZE_DEFAULT } from '@lumo/shared';
import { cn } from '@/lib/utils';
import { iconSlot, stateLayer } from '@/lib/control';
import { inputVariants } from './input';

/** The words the component says on its own. Anything left out falls back to English. */
export type PaginationLocale = {
	/** Named on the button that goes back one page. */
	previous?: string;
	/** Named on the button that goes forward one. */
	next?: string;
	/** Named on the button that goes to the first page. */
	first?: string;
	/** Named on the button that goes to the last one. */
	last?: string;
	/** Before the number, in the accessible name of a page button — and the unit after the number typed
	 * into the jump box, which is where a language that counts with a word puts it. */
	page?: string;
	/**
	 * Named on the gap before the page in view: pressing it skips a run. `{count}` is where the number of
	 * pages the press skips is said, so a language can put it where its sentence does — antd names the
	 * same press `Previous 5 Pages`, and a reader who cannot see the two chevrons hears nothing else.
	 */
	previousPages?: string;
	/** Named on the gap after it, for the same press in the other direction. */
	nextPages?: string;
	/** Named on the box a page can be asked for by number, before it. */
	goTo?: string;
};

const defaultLocale: Required<PaginationLocale> = {
	previous: 'previous page',
	next: 'next page',
	first: 'first page',
	last: 'last page',
	page: 'Page',
	previousPages: 'previous {count} pages',
	nextPages: 'next {count} pages',
	goTo: 'Go to',
};

/**
 * How many pages one press on a gap skips: far enough to save a walk through the run it hides, near
 * enough that the reader keeps their place afterwards — the number antd has always used.
 */
const JUMP_STEP = 5;

/** The one word the range is written with, whatever the noun is: `Showing`, `from`. */
const rangeWording = { leading: 'Showing', trailing: 'from' };

type PaginationState = {
	page: number;
	pageCount: number;
	total?: number;
	pageSize?: number;
	/** The records are counted in this noun, singular: the range pluralises it. */
	items: string;
	locale: Required<PaginationLocale>;
	size: 'sm' | 'md' | 'lg';
	/** A read is in the air: every control keeps its place and takes no press. */
	busy: boolean;
	go: (next: number) => void;
};

const PaginationContext = createContext<PaginationState | null>(null);

/**
 * The box every part is drawn in. `sm` and `md` sit on the same 32 / 36 tiers as a LumoButton, so a
 * pagination in a table's footer lines up with the controls beside it.
 */
export const paginationItemVariants = tv({
	base: [
		'inline-flex shrink-0 items-center justify-center rounded-md',
		'select-none whitespace-nowrap tabular-nums font-normal',
		'transition-colors duration-(--duration-state)',
		iconSlot,
	],
	variants: {
		size: {
			sm: 'h-8 min-w-8 px-2 text-sm',
			md: 'h-9 min-w-9 px-2.5 text-sm',
			lg: 'h-10 min-w-10 px-3 text-base',
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

/**
 * What a part that can be pressed adds to that box. The page in view keeps the tint the pointer
 * leaves behind instead of filling, which is how a chosen row in `LumoNav` says it is current: a footer
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

function itemOf({ size, className }: { size: PaginationState['size']; className?: string }) {
	return cn(paginationItemVariants({ size }), paginationItemStates, className);
}

export type RootProps = Omit<ComponentProps<'nav'>, 'onChange'> &
	VariantProps<typeof paginationItemVariants> & {
		/** The page in view, counted from one. A number outside the range is clamped. */
		page: number;
		/**
		 * The number of pages, when the caller already knows it. The API answers it with every page it
		 * sends, so a caller reading from one has nothing to derive.
		 */
		pageCount?: number;
		/** The number of records in all; with `pageSize` it is what the page count comes from. */
		total?: number;
		/** How many records one page holds. */
		pageSize?: number;
		/** The page a reader asked for. Nothing is written until this is called. */
		onPageChange?: (page: number) => void;
		/**
		 * What the records are called, in the singular — `user` is said as `users` by the range, and
		 * `category` as `categories`. The plural is the library's business, not the caller's.
		 */
		items?: string;
		/** Wording of the buttons, the labels and the range. */
		locale?: PaginationLocale;
		/** A read is in the air. Every press is held until it lands, so one page cannot be asked for twice. */
		busy?: boolean;
		/** Merged last through `cn()`. */
		className?: string;
	};

/**
 * The frame the parts read their page from. It owns no state: the page, the size and the total are
 * handed in and a press is handed back — the same contract the rest of the library keeps, and the
 * reason a page can be a URL, a store or a fetch as easily as a `useState`.
 *
 * The row it draws is one flex line: the parts are placed by whoever composes it, and the count pushes
 * the rest to the end by taking the slack after itself (`me-auto`) — so the way through the records and
 * the settings of the list sit together on the right, where a footer's controls belong.
 */
export function Root({
	page,
	pageCount,
	total,
	pageSize,
	size = 'md',
	onPageChange,
	items = 'item',
	locale,
	busy = false,
	className,
	children,
	'aria-label': label = 'pagination',
	...props
}: RootProps) {
	const words = useMemo(() => ({ ...defaultLocale, ...locale }), [locale]);

	// Without a count from the caller it is derived from the two numbers that make it, at the size the
	// API opens a list with — never at a size of one, which would say a page of records is a page each.
	const count = Math.max(
		1,
		pageCount ?? pageCountOf({ total: total ?? 0, pageSize: pageSize ?? PAGE_SIZE_DEFAULT }),
	);
	const current = clampPage({ page, pageCount: count });

	const value = useMemo(() => {
		const go = (next: number) => {
			const to = clampPage({ page: next, pageCount: count });
			if (to !== current) onPageChange?.(to);
		};
		return {
			page: current,
			pageCount: count,
			total,
			pageSize,
			items,
			locale: words,
			size,
			busy,
			go,
		};
	}, [current, count, total, pageSize, items, words, size, busy, onPageChange]);

	return (
		<PaginationContext value={value}>
			<nav
				data-slot="pagination"
				data-size={size}
				aria-label={label}
				aria-busy={busy || undefined}
				className={cn('flex items-center gap-2', className)}
				{...props}
			>
				{children}
			</nav>
		</PaginationContext>
	);
}

/** The page the parts are drawn for. A part outside a `Root` is a mistake, not a case. */
function usePagination(part: string) {
	const state = use(PaginationContext);
	if (state === null) throw new Error(`LumoPagination.${part} must be inside LumoPagination.Root`);
	return state;
}

/**
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

export type PageProps = ItemProps & { value: number };

/** One page. Drawn by `Pages`, and usable on its own for a window of your own making. */
export function Page({ value, className, children, ...props }: PageProps) {
	const state = usePagination('Page');
	const active = state.page === value;
	const held = heldBy({ state });

	return (
		<button
			type="button"
			data-slot="pagination-page"
			data-size={state.size}
			data-active={active ? '' : undefined}
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

export type PrevProps = ItemProps;

/** One page back. Disabled on the first page, where there is nowhere to go. */
export function Prev({ className, children, ...props }: PrevProps) {
	const state = usePagination('Prev');
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

export type NextProps = ItemProps;

/** One page on. Disabled on the last, for the same reason as `Prev`. */
export function Next({ className, children, ...props }: NextProps) {
	const state = usePagination('Next');
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

export type FirstProps = ItemProps;

/** The first page, for a list too long to walk back through a page at a time. */
export function First({ className, children, ...props }: FirstProps) {
	const state = usePagination('First');
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

export type LastProps = ItemProps;

/** The last page. The far end of `First`. */
export function Last({ className, children, ...props }: LastProps) {
	const state = usePagination('Last');
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

export type EllipsisProps = Omit<ComponentProps<'span'>, 'children'> & {
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
export function Ellipsis({
	className,
	children,
	onJump,
	direction = 'next',
	...props
}: EllipsisProps) {
	const state = usePagination('Ellipsis');
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

/**
 * Which numbers a run shows: the first and last pages, and the page in view with `siblings` on each
 * side. Everything between is one gap, however many pages it hides — a pagination that listed them
 * all would be a list of pages rather than a way through them. A run of exactly one is not a gap: a
 * single page is a box like any other, and hiding it would cost the reader a press to gain nothing.
 *
 * A gap says which way it lies, which is what its press needs: the ones before the page in view go
 * back, the ones after it go on.
 */
function pageList({ page, count, siblings }: { page: number; count: number; siblings: number }) {
	const near = siblings + 1;
	const nearEdge = (value: number) => value <= near || value > count - near;
	const shown = (value: number) => nearEdge(value) || Math.abs(value - page) <= siblings;

	const pages: { key: string; value?: number; direction?: 'prev' | 'next' }[] = [];
	let previous = 0;

	for (const value of Array.from({ length: count }, (_, index) => index + 1).filter(shown)) {
		const hidden = value - previous - 1;

		if (hidden === 1) {
			// The one page between the two runs is drawn rather than dotted over.
			pages.push({ key: `page-${previous + 1}`, value: previous + 1 });
		} else if (hidden > 1) {
			// The run of hidden pages between two numbers becomes one gap, named by the page it follows.
			pages.push({ key: `gap-${previous + 1}`, direction: value < page ? 'prev' : 'next' });
		}

		pages.push({ key: `page-${value}`, value });
		previous = value;
	}

	return pages;
}

export type PagesProps = {
	/** How many pages show on each side of the one in view. */
	siblings?: number;
	/** Merged last through `cn()`, on the box that holds the numbers. */
	className?: string;
};

/** The numbers, in a row, with the gaps between them — each gap a press that skips its run. */
export function Pages({ siblings = 1, className }: PagesProps) {
	const state = usePagination('Pages');

	return (
		<span data-slot="pagination-pages" className={cn('flex items-center gap-1', className)}>
			{pageList({ page: state.page, count: state.pageCount, siblings }).map(
				({ key, value, direction }) =>
					value === undefined ? (
						<Ellipsis
							key={key}
							direction={direction}
							onJump={() => state.go(state.page + (direction === 'prev' ? -JUMP_STEP : JUMP_STEP))}
						/>
					) : (
						<Page key={key} value={value} />
					),
			)}
		</span>
	);
}

export type RangeProps = Omit<ComponentProps<'span'>, 'children'>;

/**
 * What the page holds out of everything: `Showing 21 - 40 from 240 items` when the total is known,
 * `3 / 12` when only the page count is. It is the whole story in one line, which is what a narrow
 * screen shows in place of the numbers. The noun is the caller's — `items` — and its plural is the
 * only thing this part decides on its own.
 */
export function Range({ className, ...props }: RangeProps) {
	const state = usePagination('Range');
	const { page, pageCount, total, pageSize, items } = state;
	const { leading, trailing } = rangeWording;

	let text: string;
	if (total === undefined) {
		text = `${page.toLocaleString()} / ${pageCount.toLocaleString()}`;
	} else if (total === 0) {
		text = `${leading} 0 ${trailing} 0 ${pluralize(items, 0)}`;
	} else {
		// A caller that knows the total and the page count but not the size still gets a range: the
		// two together are the size.
		const size = Math.max(1, pageSize ?? Math.ceil(total / pageCount));
		const from = (page - 1) * size + 1;
		const to = Math.min(page * size, total);
		text = `${leading} ${from.toLocaleString()} - ${to.toLocaleString()} ${trailing} ${total.toLocaleString()} ${pluralize(items, total)}`;
	}

	return (
		<span
			data-slot="pagination-range"
			data-size={state.size}
			className={cn('text-sm text-muted-foreground tabular-nums', className)}
			{...props}
		>
			{text}
		</span>
	);
}

export type JumpProps = Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'size' | 'type'> & {
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
 * there is no value to empty and nothing for a browser to fill — which is why it is not `LumoInput`.
 */
export function Jump({ className, ...props }: JumpProps) {
	const state = usePagination('Jump');
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

/**
 * A page control: the frame, the arrows at either end, the numbers with their gaps, the line that
 * summarises them, and the box a page can be asked for by number. What it is drawn with — and how
 * many records a page holds — is a `pro` assembly's business: this layer only knows how to be pressed.
 */
export const LumoPagination = { Root, First, Prev, Next, Last, Pages, Page, Ellipsis, Range, Jump };
