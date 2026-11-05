# pagination

> Which page of the records you are on, and the way to another: a window of numbers that keeps the first and last page and collapses everything between into one gap, a line that says what the page holds out of the whole, and two arrows that disable where there is nowhere to go. The page is handed in and the press is handed back, so the same control can read from a URL, a store or a fetch.

## install

```bash
bunx shadcn@latest add @lumo/pagination
```

- payload: `/r/pagination.json`
- docs page: `/pagination`
- comes with it: `@lumo/utils`, `@lumo/control`
- npm packages: `lucide-react`, `tailwind-variants`
- lands in: `pagination.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/pagination.tsx

```tsx
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { createContext, use, useMemo, type ComponentProps, type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { iconSlot, stateLayer } from '@/lib/control';

/** The words the component says on its own. Anything left out falls back to English. */
export type PaginationLocale = {
	/** Named on the button that goes back one page. */
	previous?: string;
	/** Named on the button that goes forward one. */
	next?: string;
	/** Before the number, in the accessible name of a page button. */
	page?: string;
	/** Between the range and the total, in `Range`. */
	of?: string;
};

const defaultLocale: Required<PaginationLocale> = {
	previous: 'previous page',
	next: 'next page',
	page: 'page',
	of: 'of',
};

type PaginationState = {
	page: number;
	pageCount: number;
	total?: number;
	pageSize?: number;
	locale: Required<PaginationLocale>;
	size: 'sm' | 'md' | 'lg';
	go: (next: number) => void;
};

const PaginationContext = createContext<PaginationState | null>(null);

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

function itemOf(size: PaginationState['size'], className?: string) {
	return cn(paginationItemVariants({ size }), paginationItemStates, className);
}

export type RootProps = Omit<ComponentProps<'nav'>, 'onChange'> &
	VariantProps<typeof paginationItemVariants> & {
		/** The page in view, counted from one. A number outside the range is clamped. */
		page: number;
		/** The number of pages, when the caller already knows it. */
		pageCount?: number;
		/** The number of records in all; with `pageSize` it is what the page count comes from. */
		total?: number;
		/** How many records one page holds. */
		pageSize?: number;
		/** The page a reader asked for. Nothing is written until this is called. */
		onPageChange?: (page: number) => void;
		/** Wording of the buttons, the labels and the range. */
		locale?: PaginationLocale;
		/** Merged last through `cn()`. */
		className?: string;
	};

/**
 * The frame the parts read their page from. It owns no state: the page, the size and the total are
 * handed in and a press is handed back — the same contract the rest of the library keeps, and the
 * reason a page can be a URL, a store or a fetch as easily as a `useState`.
 */
export function Root({
	page,
	pageCount,
	total,
	pageSize,
	size = 'md',
	onPageChange,
	locale,
	className,
	children,
	'aria-label': label = 'pagination',
	...props
}: RootProps) {
	const words = useMemo(() => ({ ...defaultLocale, ...locale }), [locale]);
	const count = Math.max(1, pageCount ?? Math.ceil((total ?? 0) / Math.max(1, pageSize ?? 1)));
	const current = Math.min(Math.max(page, 1), count);

	const value = useMemo(() => {
		const go = (next: number) => {
			const to = Math.min(Math.max(next, 1), count);
			if (to !== current) onPageChange?.(to);
		};
		return { page: current, pageCount: count, total, pageSize, locale: words, size, go };
	}, [current, count, total, pageSize, words, size, onPageChange]);

	return (
		<PaginationContext value={value}>
			<nav
				data-slot="pagination"
				data-size={size}
				aria-label={label}
				className={cn('flex items-center gap-1', className)}
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
	if (state === null) throw new Error(`Pagination.${part} must be inside Pagination.Root`);
	return state;
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

	return (
		<button
			type="button"
			data-slot="pagination-page"
			data-size={state.size}
			data-active={active ? '' : undefined}
			aria-current={active ? 'page' : undefined}
			aria-label={`${state.locale.page} ${value}`}
			onClick={() => state.go(value)}
			className={itemOf(state.size, className)}
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
	const first = state.page <= 1;

	return (
		<button
			type="button"
			data-slot="pagination-prev"
			data-size={state.size}
			data-disabled={first ? '' : undefined}
			aria-label={state.locale.previous}
			disabled={first}
			onClick={() => state.go(state.page - 1)}
			className={itemOf(state.size, className)}
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

	return (
		<button
			type="button"
			data-slot="pagination-next"
			data-size={state.size}
			data-disabled={last ? '' : undefined}
			aria-label={state.locale.next}
			disabled={last}
			onClick={() => state.go(state.page + 1)}
			className={itemOf(state.size, className)}
			{...props}
		>
			{children ?? <ChevronRight />}
		</button>
	);
}

export type EllipsisProps = Omit<ComponentProps<'span'>, 'children'> & {
	/** Replaces the three dots. */
	children?: ReactNode;
	/** Merged last through `cn()`. */
	className?: string;
};

/**
 * A gap between two numbers: the pages that are not worth a box. Decoration, not a control — it is
 * `aria-hidden`, so a reader hears the numbers on either side of it and nothing else.
 */
export function Ellipsis({ className, children, ...props }: EllipsisProps) {
	const state = usePagination('Ellipsis');

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
			{children ?? <MoreHorizontal />}
		</span>
	);
}

/**
 * Which numbers a run shows: the first and last pages, and the page in view with `siblings` on each
 * side. Everything between is one gap, however many pages it hides — a pagination that listed them
 * all would be a list of pages rather than a way through them.
 */
function pageList(page: number, count: number, siblings: number) {
	const pages: { key: string; value?: number }[] = [];
	const near = siblings + 1;

	for (let value = 1; value <= count; value += 1) {
		const edge = value <= near || value > count - near;
		const around = Math.abs(value - page) <= siblings;

		if (edge || around) {
			pages.push({ key: `page-${value}`, value });
		} else if (pages.at(-1)?.value !== undefined) {
			// The run of hidden pages between two numbers becomes one gap, named by the page it follows.
			pages.push({ key: `gap-${value - 1}` });
		}
	}

	return pages;
}

export type PagesProps = {
	/** How many pages show on each side of the one in view. */
	siblings?: number;
	/** Merged last through `cn()`, on the box that holds the numbers. */
	className?: string;
};

/** The numbers, in a row, with the gaps between them. */
export function Pages({ siblings = 1, className }: PagesProps) {
	const state = usePagination('Pages');

	return (
		<span data-slot="pagination-pages" className={cn('flex items-center gap-1', className)}>
			{pageList(state.page, state.pageCount, siblings).map(({ key, value }) =>
				value === undefined ? <Ellipsis key={key} /> : <Page key={key} value={value} />,
			)}
		</span>
	);
}

export type RangeProps = Omit<ComponentProps<'span'>, 'children'>;

/**
 * What the page holds out of everything: `21–40 of 240` when the total is known, `3 / 12` when only
 * the page count is. It is the whole story in one line, which is what a narrow screen shows in place
 * of the numbers.
 */
export function Range({ className, ...props }: RangeProps) {
	const state = usePagination('Range');
	const { page, pageCount, total, pageSize, locale } = state;

	let text: string;
	if (total === undefined) {
		text = `${page.toLocaleString()} / ${pageCount.toLocaleString()}`;
	} else if (total === 0) {
		text = `0 ${locale.of} 0`;
	} else {
		// A caller that knows the total and the page count but not the size still gets a range: the
		// two together are the size.
		const size = Math.max(1, pageSize ?? Math.ceil(total / pageCount));
		const from = (page - 1) * size + 1;
		const to = Math.min(page * size, total);
		text = `${from.toLocaleString()}–${to.toLocaleString()} ${locale.of} ${total.toLocaleString()}`;
	}

	return (
		<span
			data-slot="pagination-range"
			data-size={state.size}
			className={cn('px-1 text-sm text-muted-foreground tabular-nums', className)}
			{...props}
		>
			{text}
		</span>
	);
}

/** A page control: the frame, the two arrows, the numbers, and the line that summarises them. */
export const Pagination = { Root, Prev, Next, Pages, Page, Ellipsis, Range };
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Pagination/demos/basic.tsx

```tsx
import { useState } from 'react';
import { Pagination } from '@/components/ui/pagination';

export default function Basic() {
	const [page, setPage] = useState(3);

	return (
		<Pagination.Root
			page={page}
			total={240}
			pageSize={20}
			onPageChange={setPage}
			className="min-w-0 w-full max-w-xl justify-between"
		>
			<Pagination.Range />
			<span className="flex items-center gap-1">
				<Pagination.Prev />
				<Pagination.Pages />
				<Pagination.Next />
			</span>
		</Pagination.Root>
	);
}
```

### src/pages/Pagination/demos/compact.tsx

```tsx
import { useState } from 'react';
import { Pagination } from '@/components/ui/pagination';

export default function Compact() {
	const [page, setPage] = useState(9);

	return (
		<div className="space-y-4">
			<Pagination.Root page={page} pageCount={12} onPageChange={setPage} size="sm">
				<Pagination.Prev />
				<Pagination.Range />
				<Pagination.Next />
			</Pagination.Root>
			<Pagination.Root page={page} pageCount={12} onPageChange={setPage}>
				<Pagination.Prev />
				<Pagination.Range />
				<Pagination.Next />
			</Pagination.Root>
			<Pagination.Root page={page} pageCount={12} onPageChange={setPage} size="lg">
				<Pagination.Prev />
				<Pagination.Range />
				<Pagination.Next />
			</Pagination.Root>
		</div>
	);
}
```

### src/pages/Pagination/demos/with-table.tsx

```tsx
import { useState } from 'react';
import { Pagination } from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';

const pageSize = 4;
const runs = Array.from({ length: 23 }, (_, index) => ({
	id: `run-${1041 + index}`,
	job: index % 3 === 0 ? 'e2e' : index % 3 === 1 ? 'unit' : 'docs',
	duration: `${12 + index * 7}s`,
}));

export default function WithTable() {
	const [page, setPage] = useState(1);

	const start = (page - 1) * pageSize;
	const visible = runs.slice(start, start + pageSize);

	return (
		<Table.Root variant="outlined" aria-label="recent runs, one page at a time">
			<Table.Header>
				<Table.Row>
					<Table.Head>run</Table.Head>
					<Table.Head>job</Table.Head>
					<Table.Head align="end">duration</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{visible.map((run) => (
					<Table.Row key={run.id}>
						<Table.Head scope="row">{run.id}</Table.Head>
						<Table.Cell className="text-muted-foreground">{run.job}</Table.Cell>
						<Table.Cell align="end">{run.duration}</Table.Cell>
					</Table.Row>
				))}
			</Table.Body>
			<Table.Footer>
				<Table.Row>
					<Table.Cell colSpan={3} className="py-2">
						<Pagination.Root
							page={page}
							total={runs.length}
							pageSize={pageSize}
							onPageChange={setPage}
							size="sm"
							className="justify-between"
						>
							<Pagination.Range />
							<span className="flex items-center gap-1">
								<Pagination.Prev />
								<Pagination.Pages />
								<Pagination.Next />
							</span>
						</Pagination.Root>
					</Table.Cell>
				</Table.Row>
			</Table.Footer>
		</Table.Root>
	);
}
```
