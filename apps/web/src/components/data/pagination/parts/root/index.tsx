import { clampPage, PAGE_SIZE_DEFAULT, pageCountOf } from '@lumo/shared';
import { useMemo, type ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';
import { PaginationContext } from '../context';
import { defaultLocale } from '../default-locale';

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
	 * same press `Previous 5 PaginationPages`, and a reader who cannot see the two chevrons hears nothing else.
	 */
	previousPages?: string;
	/** Named on the gap after it, for the same press in the other direction. */
	nextPages?: string;
	/** Named on the box a page can be asked for by number, before it. */
	goTo?: string;
};

/**
 * The box every part is drawn in. `sm` and `md` sit on the same 32 / 36 tiers as a Button, so a
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

export type PaginationRootProps = Omit<ComponentProps<'nav'>, 'onChange'> &
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
export function PaginationRoot({
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
}: PaginationRootProps) {
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
