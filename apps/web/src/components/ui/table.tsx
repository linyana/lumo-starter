import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	ChevronDown,
	ChevronRight,
	ListFilter,
} from 'lucide-react';
import {
	createContext,
	use,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
	type ComponentProps,
	type CSSProperties,
	type MouseEvent,
	type ReactNode,
	type RefObject,
} from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { LumoButton } from '@/components/ui/button';
import { LumoCheckbox } from '@/components/ui/checkbox';
import { LumoInput } from '@/components/ui/input';
import { LumoMenu } from '@/components/ui/menu';
import { LumoPopover } from '@/components/ui/popover';
import { LumoRadioGroup } from '@/components/ui/radio-group';
import { LumoSpinner } from '@/components/ui/spinner';
import { LumoTooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { iconSlot } from '@/lib/control';

/**
 * How a column is sorted, in the words `aria-sort` already uses. `undefined` is a column that
 * cannot be sorted, which is not the same as `none` — one is a fact about the layout, the other is
 * an invitation.
 */
export type TableSort = 'ascending' | 'descending' | 'none';

/**
 * The cycle a sortable column walks, and the same list in `Head.sortDirections`. It ends where
 * `aria-sort` has no word for it: the press after the last direction stops sorting, because a
 * reader who has tried both ways wants the order they were given, not the first one again.
 */
const defaultSortDirections: TableSort[] = ['ascending', 'descending'];

/** One line of a filter panel. `text` is what the search box reads when the label is not a string. */
export type TableFilterOption = {
	value: string;
	label: ReactNode;
	text?: string;
	disabled?: boolean;
};

/** What a custom panel is handed: the draft it is editing, and the four things it can do with it. */
export type TableFilterRenderProps = {
	value: string[];
	setValue: (next: string[]) => void;
	/** Write the draft back through `onChange` and close the panel. */
	apply: () => void;
	/** Drop the draft. Nothing is written until `apply`. */
	reset: () => void;
	close: () => void;
};

export type TableFilterProps = {
	options: TableFilterOption[];
	/** The applied answer. An empty list and `null` both mean the column is not filtered. */
	value?: string[] | null;
	/** Called on apply with the draft, or `null` when the draft is empty. */
	onChange?: (next: string[] | null) => void;
	/** `false` offers one value at a time, drawn as radios. */
	multiple?: boolean;
	/** Puts a search box over the options. */
	searchable?: boolean;
	/** Merged onto the popup, for a wider panel or a taller one. */
	className?: string;
	/** Replaces the panel itself. The draft and the actions are handed over. */
	render?: (props: TableFilterRenderProps) => ReactNode;
};

/** The words the table says on its own. Anything left out falls back to English. */
export type TableLocale = {
	sortAscending?: string;
	sortDescending?: string;
	cancelSort?: string;
	filter?: string;
	filterSearch?: string;
	filterReset?: string;
	filterApply?: string;
	filterEmpty?: string;
	loading?: string;
	selectAll?: string;
	selectNone?: string;
	selectInvert?: string;
	selectOptions?: string;
	expand?: string;
	collapse?: string;
};

const defaultLocale: Required<TableLocale> = {
	sortAscending: 'Sort ascending',
	sortDescending: 'Sort descending',
	cancelSort: 'Clear sorting',
	filter: 'Filter',
	filterSearch: 'Search options',
	filterReset: 'Reset',
	filterApply: 'Apply',
	filterEmpty: 'No options',
	loading: 'Loading',
	selectAll: 'Select every row',
	selectNone: 'Select nothing',
	selectInvert: 'Invert the selection',
	selectOptions: 'Selection options',
	expand: 'Expand',
	collapse: 'Collapse',
};

/**
 * A chosen set of rows, as data: the keys the column of boxes acts on, the keys that are chosen, and
 * the way back. It is handed to both the header and each cell, so the two can never disagree about
 * which rows are in play — the header acts on exactly what its column can see.
 */
export type TableSelection = {
	/** Every key the header's control acts on: the rows in view, not the whole data set. */
	keys: readonly string[];
	/** The chosen keys. */
	value: readonly string[];
	/** Called with the chosen keys, whole — a list, never a patch. */
	onChange: (next: string[]) => void;
	/** `radio` chooses one row at a time; a box is the default. */
	type?: 'checkbox' | 'radio';
	/** Offer all / invert / none beside the header box, where a page holds more than a few rows. */
	menu?: boolean;
};

/**
 * Two settings a part cannot be told individually: the cycle a press walks and the words the table
 * speaks. Both are table-wide by nature — a column with its own cycle would make two headers count
 * differently — so they come from the root and a column may still override the cycle.
 */
const TableContext = createContext<{
	sortDirections: TableSort[];
	locale: Required<TableLocale>;
}>({ sortDirections: defaultSortDirections, locale: defaultLocale });

const textOf = (node: ReactNode) =>
	typeof node === 'string' || typeof node === 'number' ? String(node) : undefined;

/** Whether the header a title cell belongs to holds still, which is what makes that cell sticky. */
const HeaderContext = createContext<{ sticky: boolean } | null>(null);

/** Two of them, so the provider's value is a constant rather than an object built per render. */
const StickyHeader = { sticky: true };
const StillHeader = { sticky: false };

/** The two ways a table leaves its frame: sideways when it is wider than it was given room for. */
export type TableScroll = {
	/** A floor on the table's own width, so the frame scrolls instead of squeezing the columns. */
	x?: number | string;
	/** A ceiling on the frame's height, so the records scroll under the header. */
	y?: number | string;
};

/** Which edge a column is pinned to. How far it is pinned is measured, never declared. */
export type TableFixed = 'start' | 'end';

/** The breakpoints a column can be shown from, in the order the theme names them. */
const breakpoints = ['sm', 'md', 'lg', 'xl', '2xl'] as const;

export type TableBreakpoint = (typeof breakpoints)[number];

/** One class per breakpoint, because a class name assembled at runtime is never generated. */
const responsiveDisplay: Record<TableBreakpoint, string> = {
	sm: 'hidden sm:table-cell',
	md: 'hidden md:table-cell',
	lg: 'hidden lg:table-cell',
	xl: 'hidden xl:table-cell',
	'2xl': 'hidden 2xl:table-cell',
};

/**
 * A column appears from the smallest breakpoint it names, which is how the list reads: the screen has
 * to be at least that wide. An empty list is a column that is never shown.
 */
function responsiveClass(responsive: TableBreakpoint[] | undefined) {
	if (responsive === undefined) return undefined;
	const first = breakpoints.find((one) => responsive.includes(one));
	return first === undefined ? 'hidden' : responsiveDisplay[first];
}

/**
 * Whether there is still something to read past either edge of the frame. A pinned column casts its
 * shadow from this and not from its own position, so nothing is cast while the table fits.
 */
function syncScroll(box: HTMLElement) {
	const rest = box.scrollWidth - box.clientWidth - box.scrollLeft;
	const mark = ({ name, on }: { name: string; on: boolean }) => {
		if (on === box.hasAttribute(name)) return;
		if (on) box.setAttribute(name, '');
		else box.removeAttribute(name);
	};
	mark({ name: 'data-scrolled-start', on: box.scrollLeft > 1 });
	mark({ name: 'data-scrolled-end', on: rest > 1 });
}

/** Where a pinned column's offset is written, in pixels, for its own rule to read. */
const fixedOffset = '--table-fixed-offset';

function place({ cell, offset }: { cell: HTMLTableCellElement; offset: number }) {
	const value = `${offset}px`;
	if (cell.style.getPropertyValue(fixedOffset) !== value)
		cell.style.setProperty(fixedOffset, value);
}

/** The column at the inner end of a run of pinned columns is the one that casts the shadow. */
function markEdge({ cell, edge }: { cell: HTMLTableCellElement; edge: TableFixed | undefined }) {
	if (edge === undefined) {
		if (cell.hasAttribute('data-fixed-edge')) cell.removeAttribute('data-fixed-edge');
		return;
	}
	if (cell.getAttribute('data-fixed-edge') !== edge) cell.setAttribute('data-fixed-edge', edge);
}

/**
 * The two things a table cannot be told from its own markup: how far each pinned column is from the
 * edge it is pinned to, and how far down each sticky header row starts.
 *
 * Both are measured from the cells, which is why a column only has to name an edge instead of an
 * offset, and why a grouped header stacks without anyone adding up row heights. The widths are the
 * layout's own — `offsetWidth`, not the rectangle a transform ancestor or a zoom would report — and
 * every write is compared first, so a render that changes nothing costs one pass and no invalidation.
 */
function measureTable({ element, box }: { element: HTMLTableElement; box: HTMLElement }) {
	if (element.querySelector('[data-fixed]') !== null) {
		for (const row of element.rows) {
			const cells = Array.from(row.cells);
			const starts = cells.filter((cell) => cell.dataset.fixed === 'start');
			const ends = cells.filter((cell) => cell.dataset.fixed === 'end').reverse();

			let start = 0;
			for (const [index, cell] of starts.entries()) {
				place({ cell, offset: start });
				markEdge({ cell, edge: index === starts.length - 1 ? 'start' : undefined });
				start += cell.offsetWidth;
			}

			let end = 0;
			for (const [index, cell] of ends.entries()) {
				place({ cell, offset: end });
				markEdge({ cell, edge: index === ends.length - 1 ? 'end' : undefined });
				end += cell.offsetWidth;
			}
		}
	}

	const head = element.tHead;
	if (head !== null && head.hasAttribute('data-sticky')) {
		let top = 0;
		for (const row of head.rows) {
			const value = `${top}px`;
			if (row.style.getPropertyValue('--table-head-top') !== value) {
				row.style.setProperty('--table-head-top', value);
			}
			top += row.offsetHeight;
		}
	}

	syncScroll(box);
}

/**
 * Runs the measurement after every render, because a new row is a new set of cells to place, and
 * again on a resize of either the table or its frame, which changes widths without rendering.
 */
function useTableLayout(root: RefObject<HTMLDivElement | null>) {
	useLayoutEffect(() => {
		const element = root.current?.querySelector('table');
		const box = root.current?.querySelector<HTMLElement>('[data-slot="table-container"]');
		if (!element || !box) return;
		measureTable({ element, box });
	});

	useEffect(() => {
		const element = root.current?.querySelector('table');
		const box = root.current?.querySelector<HTMLElement>('[data-slot="table-container"]');
		if (!element || !box) return;
		const observer = new ResizeObserver(() => measureTable({ element, box }));
		observer.observe(element);
		observer.observe(box);
		return () => observer.disconnect();
	}, [root]);
}

/**
 * The washes a row can show, on a pinned cell. The cell's fill is opaque — nothing may be read
 * through a column standing in front of the others — so a translucent row state is laid on top of
 * it as a layer instead of replacing it.
 */
const fixedRowStates = cn(
	// Below the cell's own content, above its fill, so the wash tints the row and not the words in it.
	'before:pointer-events-none before:absolute before:inset-0 before:-z-10',
	'before:bg-row-hover before:opacity-0',
	'before:transition-[opacity,background-color] before:duration-(--duration-state)',
	'[[data-slot=table-container][data-hoverable=true]_tbody>tr:not([data-selected]):hover>&]:before:opacity-100',
	'[tr[data-selected]>&]:before:bg-row-selected [tr[data-selected]>&]:before:opacity-100',
	'[tr[data-selected]:hover>&]:before:bg-row-selected-hover',
);

/**
 * The shadow of a pinned column, cast past its inner edge and only while something is passing under
 * it: the frame says which edges still have content behind them, and the last pinned column of a run
 * is the only one that draws it.
 */
const fixedShadow = cn(
	'after:pointer-events-none after:absolute after:inset-y-0 after:w-4',
	'after:from-foreground/10 after:to-transparent after:opacity-0',
	'after:transition-opacity after:duration-(--duration-state)',
	'[[data-scrolled-start]_&[data-fixed-edge=start]]:after:opacity-100',
	'[[data-scrolled-end]_&[data-fixed-edge=end]]:after:opacity-100',
);

/** Which layer a cell is drawn on: a pinned one in front of its row, a title in front of the records. */
function layerOf({
	fixed,
	inHead,
	holds,
}: {
	fixed: TableFixed | undefined;
	inHead: boolean;
	holds: boolean;
}) {
	if (fixed !== undefined) return inHead ? 'z-20' : 'z-1';
	return holds ? 'z-10' : undefined;
}

/** What a column pinned to an edge is drawn with, whether it is a title or a cell. */
function fixedClass(fixed: TableFixed | undefined) {
	if (fixed === undefined) return undefined;
	return cn(
		'sticky bg-[var(--table-surface,var(--background))]',
		fixed === 'start'
			? 'left-[var(--table-fixed-offset,0px)]'
			: 'right-[var(--table-fixed-offset,0px)]',
		fixedRowStates,
		fixed === 'start'
			? 'after:left-full after:bg-linear-to-r'
			: 'after:right-full after:bg-linear-to-l',
		fixedShadow,
	);
}

/**
 * Frameless by default so records can sit inside a LumoCard or panel. Standalone tables can choose
 * an outlined or filled surface; neither adds a grid between the columns.
 *
 * Two measurements, inherited by every part. `--cell-py` and `--cell-px` are the whole density of
 * the table: a head, a cell and the empty state are all inset by them, so the size variant is the
 * only knob and a part added later is drawn at it without being told to be.
 *
 * The border model is `separate` with no spacing rather than `collapse`, because a collapsed border
 * belongs to the table and scrolls with it — a sticky header drawn that way loses its bottom rule
 * the moment it sticks. So the line under a row is drawn by each of its cells instead.
 */
export const tableVariants = tv({
	base: [
		'min-w-0 w-full overflow-auto text-sm',
		'[&>table:has(>tfoot)>tbody>tr:last-child>*]:border-b-0',
	],
	variants: {
		size: {
			sm: '[--cell-px:--spacing(3)] [--cell-py:--spacing(2)]',
			md: '[--cell-px:--spacing(4)] [--cell-py:--spacing(3)]',
			lg: '[--cell-px:--spacing(5)] [--cell-py:--spacing(4)]',
		},
		variant: {
			borderless: '',
			outlined: [
				'rounded-lg border bg-card text-card-foreground [--table-surface:var(--card)]',
				'[&>table>tbody>tr:last-child>*]:border-b-0',
			],
			filled: [
				'rounded-lg bg-muted [--table-surface:var(--muted)]',
				'[&>table>tbody>tr:last-child>*]:border-b-0',
			],
		},
	},
	defaultVariants: {
		size: 'md',
		variant: 'borderless',
	},
});

export type RootProps = Omit<ComponentProps<'table'>, 'className'> &
	VariantProps<typeof tableVariants> & {
		/**
		 * Merged last through `cn()`, on the scrolling frame and not on the `<table>` — the frame is
		 * what a caller sizes, rounds and gives the table's height to. Every other prop is the
		 * table's own, so `aria-label` still lands on the element a screen reader reads.
		 */
		className?: string;
		/**
		 * The two axes of the frame, both a way out of squeezing the records: `x` puts a floor under the
		 * table's width so it scrolls sideways, `y` puts a ceiling on the frame so a sticky header can
		 * hold still. Either is a pixel count or any CSS length; both are applied to the frame.
		 */
		scroll?: TableScroll;
		/** Highlight body rows under the pointer without changing selection or sorting. */
		hoverable?: boolean;
		/**
		 * The directions a press on a sortable column walks before it stops sorting. The step after
		 * the last one always clears the column, so a cycle that cannot be left is not offered.
		 */
		sortDirections?: TableSort[];
		/** The words behind the controls the table draws itself: sort hints, the filter panel. */
		locale?: TableLocale;
		/** Cover the records with a spinner while keeping them, and their column names, in place. */
		loading?: boolean;
		/**
		 * `fixed` gives every column the width it was declared, which is what `ellipsis` needs: an
		 * automatic layout decides widths from the content it is asked to cut off.
		 */
		layout?: 'auto' | 'fixed';
	};

/**
 * A table of records. The frame scrolls, so a table wider than its column is read sideways rather
 * than squeezed; the table inside it keeps the semantics, which is the half of this component the
 * browser already knew how to do.
 */
export function Root({
	size = 'md',
	variant = 'borderless',
	hoverable = true,
	loading = false,
	layout = 'auto',
	sortDirections = defaultSortDirections,
	locale,
	scroll,
	className,
	style,
	children,
	...props
}: RootProps) {
	const root = useRef<HTMLDivElement>(null);
	useTableLayout(root);

	const value = useMemo(
		() => ({ sortDirections, locale: { ...defaultLocale, ...locale } }),
		[sortDirections, locale],
	);

	return (
		<TableContext value={value}>
			<div
				ref={root}
				data-slot="table-root"
				data-size={size}
				data-variant={variant}
				data-loading={loading ? '' : undefined}
				aria-busy={loading || undefined}
				className="relative min-w-0 w-full"
			>
				<div
					data-slot="table-container"
					data-size={size}
					data-variant={variant}
					data-hoverable={hoverable}
					style={scroll?.y === undefined ? undefined : { maxHeight: scroll.y }}
					onScroll={(event) => syncScroll(event.currentTarget)}
					className={cn(
						tableVariants({ size, variant }),
						layout === 'fixed' && '[&>table]:table-fixed',
						className,
					)}
				>
					<table
						data-slot="table"
						style={{ minWidth: scroll?.x, ...style }}
						className="w-full border-separate border-spacing-0 caption-bottom"
						{...props}
					>
						{children}
					</table>
				</div>
				{loading && (
					<div
						data-slot="table-loading"
						role="status"
						className={cn(
							'absolute inset-0 z-20 grid place-items-center',
							'bg-background/70 text-muted-foreground',
							variant !== 'borderless' && 'rounded-lg',
						)}
					>
						<span className="inline-flex items-center gap-2 text-sm">
							<LumoSpinner label={null} />
							{value.locale.loading}
						</span>
					</div>
				)}
			</div>
		</TableContext>
	);
}

export type HeaderProps = ComponentProps<'thead'> & {
	/**
	 * Holds the column names in place while the rows pass under them, which is what a table with a
	 * height needs. Every row of the header holds, so a grouped header stacks: each row is measured
	 * and starts under the one above it. The frame needs a ceiling — `scroll={{ y }}` or a height
	 * class — and the header sticks to that frame, not to the page around it.
	 */
	sticky?: boolean;
};

/**
 * The band the column names sit in. It is a wash of the text colour over whatever surface the table
 * is on — faint, because it names the columns and is not a record itself — but it is opaque, which
 * is what a sticky header needs when the rows pass under it.
 */
export function Header({ sticky = false, className, ...props }: HeaderProps) {
	return (
		<HeaderContext value={sticky ? StickyHeader : StillHeader}>
			<thead
				data-slot="table-header"
				data-sticky={sticky ? '' : undefined}
				className={cn('[&>tr>th]:bg-table-head', className)}
				{...props}
			/>
		</HeaderContext>
	);
}

export type BodyProps = ComponentProps<'tbody'>;

/** The records. */
export function Body({ className, ...props }: BodyProps) {
	return <tbody data-slot="table-body" className={className} {...props} />;
}

export type FooterProps = ComponentProps<'tfoot'>;

/**
 * A line of totals under the records. It wears the header's band, because it is the same kind of
 * row: one that is not a record. Being the same colour as one would leave a reader counting it.
 */
export function Footer({ className, ...props }: FooterProps) {
	return (
		<tfoot
			data-slot="table-footer"
			className={cn(
				'bg-table-head font-medium [&>tr:first-child>*]:border-t [&>tr:last-child>*]:border-b-0',
				className,
			)}
			{...props}
		/>
	);
}

/**
 * Two fills, and they are not the same fill. The pointer leaves a wash of the text colour, gone a
 * frame after it passes; a chosen row leaves a tint of `primary`, which in this theme is also a
 * near-black and so has to be mixed a step stronger to still be there once the pointer has left.
 */
export const tableRowVariants = tv({
	base: [
		'transition-colors duration-(--duration-state)',
		'[[data-slot=table-container][data-hoverable=true]>table>tbody>&]:hover:bg-row-hover',
		'[tbody>&]:data-selected:bg-row-selected',
		'[[data-slot=table-container][data-hoverable=true]>table>tbody>&]:data-selected:hover:bg-row-selected-hover',
		// A row that cannot be acted on is out of the way rather than hidden: the records around it
		// are still true, so it keeps its place and its text, and loses its answers.
		'data-disabled:pointer-events-none data-disabled:opacity-50',
	],
});

export type RowProps = ComponentProps<'tr'> & {
	/**
	 * How deep the record sits under the one above it. It is written as `--table-depth`, which
	 * `LumoTable.Branch` insets by, so a tree reads as a tree and a row keeps one class at every level.
	 */
	depth?: number;
};

/** One record. */
export function Row({ depth, className, style, ...props }: RowProps) {
	return (
		<tr
			data-slot="table-row"
			data-depth={depth}
			style={depth === undefined ? style : ({ '--table-depth': depth, ...style } as CSSProperties)}
			className={cn(tableRowVariants(), className)}
			{...props}
		/>
	);
}

/**
 * What every column is drawn with: the inset, the rule under it, and which edge its text is set
 * from. A header and a cell are the same box — one names the column and one fills it — so both are
 * built from this, and a column set from the end reads as one line from its name to its last figure.
 *
 * Figures are tabular everywhere, not only in a column set from the end, because the digits in a
 * cell are usually being compared with the digits in the cell above it.
 */
export const tableCellVariants = tv({
	base: ['border-b px-(--cell-px) py-(--cell-py) align-middle whitespace-nowrap tabular-nums'],
	variants: {
		align: {
			start: 'text-start',
			center: 'text-center',
			end: 'text-end',
		},
	},
	defaultVariants: {
		align: 'start',
	},
});

/** One line, cut off at the column's width. `--cell-max-w` is how far a column may run. */
const ellipsisCell = 'max-w-[var(--cell-max-w,15rem)] overflow-hidden text-ellipsis';

/**
 * A control in a column title: one 24px square holding one glyph, tinted while the pointer is on it
 * and tinted again, kept, while its column is sorted or filtered. The sort arrow and the filter icon
 * are the same control, so a reader learns one shape and reads both.
 *
 * The tint is painted on the square; the pointer is taken from a wider invisible box, so a header can
 * hold two of these a gap apart without their targets merging.
 */
const headControl = cn(
	'relative inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm',
	'text-muted-foreground transition-colors duration-(--duration-state)',
	'hover:bg-row-hover hover:text-foreground',
	'data-active:bg-row-hover',
	'before:absolute before:-inset-1.5',
);

const filterOptionClass = cn(
	'flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm select-none',
	'has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50',
	'hover:bg-row-hover',
);

/**
 * The panel behind a header's filter icon. It edits a draft, because a list of checkboxes that took
 * effect on every press would refetch the table for each one — the reader picks, then says so.
 */
function FilterPanel({
	filter,
	locale,
	label,
	onClose,
}: {
	filter: TableFilterProps;
	locale: Required<TableLocale>;
	label?: string;
	onClose: () => void;
}) {
	const { options, multiple = true, searchable = false, render } = filter;
	const [draft, setDraft] = useState<string[]>(filter.value ?? []);
	const [query, setQuery] = useState('');

	const needle = query.trim().toLowerCase();
	const visible =
		needle.length === 0
			? options
			: options.filter((option) =>
					(option.text ?? textOf(option.label) ?? option.value).toLowerCase().includes(needle),
				);

	const toggle = ({ value, on }: { value: string; on: boolean }) =>
		setDraft((was) =>
			on ? [...was.filter((one) => one !== value), value] : was.filter((one) => one !== value),
		);
	const apply = () => {
		filter.onChange?.(draft.length === 0 ? null : draft);
		onClose();
	};
	const reset = () => setDraft([]);

	if (render !== undefined) {
		return <>{render({ value: draft, setValue: setDraft, apply, reset, close: onClose })}</>;
	}

	const nameOf = (option: TableFilterOption) => option.text ?? textOf(option.label) ?? option.value;

	const optionRow = (option: TableFilterOption) => {
		const name = nameOf(option);
		return (
			<label
				key={option.value}
				className={filterOptionClass}
				data-disabled={option.disabled ? '' : undefined}
			>
				{multiple ? (
					<LumoCheckbox.Root
						aria-label={name}
						checked={draft.includes(option.value)}
						disabled={option.disabled}
						onCheckedChange={(next) => toggle({ value: option.value, on: next === true })}
					>
						<LumoCheckbox.Indicator />
					</LumoCheckbox.Root>
				) : (
					<LumoRadioGroup.Item aria-label={name} value={option.value} disabled={option.disabled}>
						<LumoRadioGroup.Indicator />
					</LumoRadioGroup.Item>
				)}
				<span className="min-w-0 truncate">{option.label}</span>
			</label>
		);
	};

	return (
		<div data-slot="table-filter-panel" className="flex max-h-80 flex-col">
			{searchable && (
				<div className="border-b p-2">
					<LumoInput
						size="sm"
						value={query}
						aria-label={
							label === undefined ? locale.filterSearch : `${locale.filterSearch} ${label}`
						}
						placeholder={locale.filterSearch}
						onChange={(event) => setQuery(event.target.value)}
					/>
				</div>
			)}
			<div className="min-h-0 flex-1 overflow-auto p-1">
				{visible.length === 0 ? (
					<p className="px-2 py-6 text-center text-sm text-muted-foreground">
						{locale.filterEmpty}
					</p>
				) : multiple ? (
					visible.map(optionRow)
				) : (
					<LumoRadioGroup.Root
						className="gap-0"
						value={draft[0] ?? null}
						onValueChange={(next) => setDraft(next == null ? [] : [String(next)])}
					>
						{visible.map(optionRow)}
					</LumoRadioGroup.Root>
				)}
			</div>
			<div className="flex items-center justify-end gap-2 border-t p-2">
				<LumoButton variant="ghost" size="sm" disabled={draft.length === 0} onClick={reset}>
					{locale.filterReset}
				</LumoButton>
				<LumoButton size="sm" onClick={apply}>
					{locale.filterApply}
				</LumoButton>
			</div>
		</div>
	);
}

/**
 * The filter icon in a column's title, and the popup it opens. It is tinted while the column is
 * filtered, which is the only sign of an applied filter once the panel is closed.
 */
function FilterControl({
	filter,
	locale,
	label,
}: {
	filter: TableFilterProps;
	locale: Required<TableLocale>;
	label?: string;
}) {
	const [open, setOpen] = useState(false);
	const active = (filter.value?.length ?? 0) > 0;

	return (
		<LumoPopover.Root open={open} onOpenChange={setOpen}>
			<LumoPopover.Trigger
				data-slot="table-filter"
				data-active={active ? '' : undefined}
				aria-label={label === undefined ? locale.filter : `${locale.filter} ${label}`}
				className={cn(headControl, 'data-active:text-primary', iconSlot)}
			>
				<ListFilter />
			</LumoPopover.Trigger>
			<LumoPopover.Portal>
				<LumoPopover.Positioner sideOffset={6} align="end">
					<LumoPopover.Popup className={cn('w-60 p-0', filter.className)}>
						<FilterPanel
							filter={filter}
							locale={locale}
							label={label}
							onClose={() => setOpen(false)}
						/>
					</LumoPopover.Popup>
				</LumoPopover.Positioner>
			</LumoPopover.Portal>
		</LumoPopover.Root>
	);
}

export type HeadProps = Omit<ComponentProps<'th'>, 'align'> &
	VariantProps<typeof tableCellVariants> & {
		/** Which way this column is sorted by. Left out, it is a column that cannot be sorted. */
		sort?: TableSort;
		/**
		 * What to do about the arrow being pressed. Given, the name becomes a button and the cell
		 * says with `aria-sort` what the arrow is showing.
		 *
		 * The next state is handed over rather than asked for: the cycle ends in "stop sorting", and
		 * a column that only reported "pressed" would leave every caller to write that step again.
		 * Ordering the rows is still the caller's — a table that sorted what it was handed would be
		 * quietly disagreeing with whoever fetched it.
		 */
		onSort?: (next: TableSort | undefined) => void;
		/** This column's own cycle. The step after the last direction clears the column. */
		sortDirections?: TableSort[];
		/** A filter panel behind an icon beside the title. */
		filter?: TableFilterProps;
		/**
		 * Pin the column to an edge of the frame, so it stays readable while the rest scrolls under it.
		 * The offset is measured from the columns beside it; nothing has to be declared beyond the edge.
		 */
		fixed?: TableFixed;
		/** Show the column from a breakpoint up. Give the same list to its `LumoTable.Cell`s. */
		responsive?: TableBreakpoint[];
		/** Cut the title off at the column's width, and keep the whole of it in `title`. */
		ellipsis?: boolean | { showTitle?: boolean };
	};

/** The direction the arrow points. Unsorted is the two-headed one, quiet, so the column still says it can move. */
function SortArrow({ sort }: { sort: TableSort }) {
	if (sort === 'ascending') return <ArrowUp />;
	if (sort === 'descending') return <ArrowDown />;

	return <ArrowUpDown className="opacity-40 transition-opacity group-hover/sort:opacity-100" />;
}

/** The state a press leads to, including the `undefined` that means "and now not at all". */
function nextSort({
	directions,
	current,
}: {
	directions: TableSort[];
	current: TableSort;
}): TableSort | undefined {
	const index = directions.indexOf(current);
	return directions[index + 1];
}

/**
 * A column title is quieter than its data; a row title (`scope="row"`) keeps the body's size and
 * colour. A sortable title becomes a button and announces its direction on the enclosing cell.
 */
export function Head({
	align = 'start',
	scope = 'col',
	sort,
	onSort,
	sortDirections,
	filter,
	fixed,
	responsive,
	ellipsis = false,
	title,
	onClick,
	className,
	children,
	...props
}: HeadProps) {
	const table = use(TableContext);
	const header = use(HeaderContext);
	const holds = header?.sticky === true;
	const rowHeader = scope === 'row' || scope === 'rowgroup';
	const current = sort ?? 'none';
	const next = nextSort({ directions: sortDirections ?? table.sortDirections, current });
	const hint =
		next === 'ascending'
			? table.locale.sortAscending
			: next === 'descending'
				? table.locale.sortDescending
				: table.locale.cancelSort;
	const label = textOf(children);
	const showTitle = typeof ellipsis === 'object' ? ellipsis.showTitle !== false : true;
	const filtered = (filter?.value?.length ?? 0) > 0;
	const sorted = sort === 'ascending' || sort === 'descending';

	const sortable = onSort !== undefined;
	// The cell is the pointer's target, as it is in antd and in lobe: a title is easier to hit than
	// a 24px arrow. It is not the keyboard's — the arrow button is, and it carries the same press
	// with a name. A press that lands on a control of its own, or that a caller has already handled,
	// is left alone, so nothing here fires twice.
	const pressCell = (event: MouseEvent<HTMLTableCellElement>) => {
		onClick?.(event);
		if (!sortable || event.defaultPrevented) return;
		if ((event.target as Element).closest('button, a, input, select, textarea')) return;
		onSort(next);
	};

	const sortButton =
		onSort === undefined ? null : (
			<button
				type="button"
				data-slot="table-sort"
				data-active={sorted ? '' : undefined}
				aria-label={label === undefined ? hint : `${hint} ${label}`}
				onClick={() => onSort(next)}
				className={cn(headControl, 'group/sort data-active:text-foreground', iconSlot)}
			>
				<SortArrow sort={current} />
			</button>
		);

	const cell = (
		<th
			scope={scope}
			data-slot="table-head"
			data-align={align}
			data-sort={sort}
			data-fixed={fixed}
			data-filtered={filtered ? '' : undefined}
			aria-sort={sort ?? (onSort === undefined ? undefined : 'none')}
			title={title ?? (ellipsis && showTitle ? label : undefined)}
			onClick={sortable || onClick !== undefined ? pressCell : undefined}
			className={cn(
				tableCellVariants({ align }),
				ellipsis && ellipsisCell,
				'transition-colors duration-(--duration-state)',
				rowHeader ? 'font-medium' : 'text-sm font-semibold text-muted-foreground',
				sortable && '[thead>tr>&]:hover:bg-table-head-hover',
				'data-[sort=ascending]:text-foreground data-[sort=descending]:text-foreground',
				// The band runs down the column, so it starts here, opaque: a sticky header may not show
				// the records that pass under it.
				'data-[sort=ascending]:bg-table-head-hover data-[sort=descending]:bg-table-head-hover',
				// A title holds still at the top of the frame and a pinned one at its edge as well. The
				// pinned column stands in front of the rest, so it is drawn above the other titles — and
				// only a title may be given the top, since a pinned record still has to scroll away.
				(fixed !== undefined || holds) && 'sticky',
				holds && 'top-[var(--table-head-top,0px)]',
				layerOf({ fixed, inHead: header !== null, holds }),
				fixedClass(fixed),
				responsiveClass(responsive),
				sortable && 'cursor-pointer select-none',
				className,
			)}
			{...props}
		>
			{onSort === undefined && filter === undefined ? (
				children
			) : (
				<span
					data-slot="table-head-controls"
					className="inline-flex max-w-full min-w-0 items-center gap-1.5"
				>
					<span className="min-w-0 truncate">{children}</span>
					{sortButton}
					{filter !== undefined && (
						<FilterControl filter={filter} locale={table.locale} label={label} />
					)}
				</span>
			)}
		</th>
	);

	if (!sortable) return cell;

	return (
		<LumoTooltip.Root>
			<LumoTooltip.Trigger render={cell} />
			<LumoTooltip.Portal>
				<LumoTooltip.Positioner>
					<LumoTooltip.Popup>{hint}</LumoTooltip.Popup>
				</LumoTooltip.Positioner>
			</LumoTooltip.Portal>
		</LumoTooltip.Root>
	);
}

export type CellProps = Omit<ComponentProps<'td'>, 'align'> &
	VariantProps<typeof tableCellVariants> & {
		/** Cut the cell off at the column's width, and keep the whole of it in `title`. */
		ellipsis?: boolean | { showTitle?: boolean };
		/**
		 * The direction its column is displayed in, as `LumoTable.Head` was told. A sorted column shades its
		 * cells, so it reads as one band from the header down; `none` shades nothing.
		 */
		sort?: TableSort;
		/**
		 * Pin the column to an edge of the frame, exactly as its `LumoTable.Head` does: the offset is
		 * measured from the columns beside it, so the two only have to agree on the edge.
		 */
		fixed?: TableFixed;
		/** Show the column from a breakpoint up. Give the same list to its `LumoTable.Head`. */
		responsive?: TableBreakpoint[];
	};

/** One field of one record. */
export function Cell({
	align = 'start',
	ellipsis = false,
	sort,
	fixed,
	responsive,
	title,
	className,
	children,
	...props
}: CellProps) {
	const showTitle = typeof ellipsis === 'object' ? ellipsis.showTitle !== false : true;
	const sorted = sort === 'ascending' || sort === 'descending';

	return (
		<td
			data-slot="table-cell"
			data-align={align}
			data-sort={sort}
			data-fixed={fixed}
			data-ellipsis={ellipsis ? '' : undefined}
			title={title ?? (ellipsis && showTitle ? textOf(children) : undefined)}
			className={cn(
				tableCellVariants({ align }),
				ellipsis && ellipsisCell,
				// The band the header starts, carried down the column. On a pinned cell it becomes a layer
				// over the opaque base rather than the fill itself, because that fill has to stay solid.
				fixed === undefined
					? 'data-[sort=ascending]:bg-column-sorted data-[sort=descending]:bg-column-sorted'
					: sorted && 'bg-[linear-gradient(var(--color-column-sorted),var(--color-column-sorted))]',
				fixed !== undefined && 'z-1',
				fixedClass(fixed),
				responsiveClass(responsive),
				className,
			)}
			{...props}
		>
			{children}
		</td>
	);
}

export type SelectionHeadProps = Omit<ComponentProps<'th'>, 'children' | 'align'> & {
	/** The logical edge the column is set from. */
	align?: 'start' | 'center' | 'end';
	/** The chosen rows, and the way back. */
	selection: TableSelection;
	/** Pin the column, exactly as `LumoTable.Head` does. */
	fixed?: TableFixed;
	/** Merged last through `cn()`. */
	className?: string;
};

/**
 * The column of boxes: one for every row in view, and a menu that picks them all at once. It acts on
 * `selection.keys` and nothing else, which is what lets a fetched page and a shared selected set live
 * together — the header never claims a row it cannot see.
 */
export function SelectionHead({ selection, fixed, className, ...props }: SelectionHeadProps) {
	const table = use(TableContext);
	const { keys, value, onChange, type = 'checkbox', menu = false } = selection;
	const all = keys.length > 0 && keys.every((key) => value.includes(key));
	const some = !all && keys.some((key) => value.includes(key));

	// One list in, one list out: the header adds or drops the keys it is responsible for and leaves
	// whatever the caller was holding on a page it can no longer see alone.
	const keep = (next: string[]) => onChange([...new Set(next)]);
	const clear = value.filter((key) => !keys.includes(key));

	return (
		<Head
			fixed={fixed}
			data-slot="table-selection-head"
			className={cn('w-10', className)}
			{...props}
		>
			<span data-slot="table-selection" className="flex items-center gap-1">
				{type === 'checkbox' && (
					<LumoCheckbox.Root
						aria-label={table.locale.selectAll}
						checked={all}
						indeterminate={some}
						onCheckedChange={(next) => keep(next === true ? [...value, ...keys] : clear)}
					>
						<LumoCheckbox.Indicator />
					</LumoCheckbox.Root>
				)}
				{type === 'checkbox' && menu && (
					<LumoMenu.Root>
						<LumoMenu.Trigger
							aria-label={table.locale.selectOptions}
							render={
								<button
									type="button"
									data-slot="table-selection-menu"
									className={cn(headControl, iconSlot)}
								/>
							}
						>
							<ChevronDown />
						</LumoMenu.Trigger>
						<LumoMenu.Portal>
							<LumoMenu.Positioner sideOffset={6} align="start">
								<LumoMenu.Popup>
									<LumoMenu.Item onClick={() => keep([...value, ...keys])}>
										{table.locale.selectAll}
									</LumoMenu.Item>
									<LumoMenu.Item
										onClick={() => keep(clear.concat(keys.filter((key) => !value.includes(key))))}
									>
										{table.locale.selectInvert}
									</LumoMenu.Item>
									<LumoMenu.Item onClick={() => keep(clear)}>
										{table.locale.selectNone}
									</LumoMenu.Item>
								</LumoMenu.Popup>
							</LumoMenu.Positioner>
						</LumoMenu.Portal>
					</LumoMenu.Root>
				)}
			</span>
		</Head>
	);
}

export type SelectionCellProps = Omit<ComponentProps<'td'>, 'children' | 'align'> & {
	/** The logical edge the cell is set from. */
	align?: 'start' | 'center' | 'end';
	/** The chosen rows, and the way back — the same object the header was given. */
	selection: TableSelection;
	/** The key of the record this box belongs to. */
	value: string;
	/** What a screen reader hears instead of the key: the record's own name. */
	label?: string;
	/** A record that cannot be chosen. */
	disabled?: boolean;
	/** Pin the column, exactly as `LumoTable.Cell` does. */
	fixed?: TableFixed;
	/** Merged last through `cn()`. */
	className?: string;
};

/** One box, for one record, belonging to the set the header is holding. */
export function SelectionCell({
	selection,
	value,
	label,
	disabled = false,
	fixed,
	className,
	...props
}: SelectionCellProps) {
	const { value: chosen, onChange, type = 'checkbox' } = selection;
	const checked = chosen.includes(value);
	const name = label ?? value;

	return (
		<Cell
			fixed={fixed}
			data-slot="table-selection-cell"
			className={cn('w-10', className)}
			{...props}
		>
			{type === 'radio' ? (
				<LumoRadioGroup.Root
					value={checked ? value : null}
					disabled={disabled}
					onValueChange={() => onChange([value])}
				>
					<LumoRadioGroup.Item value={value} aria-label={name}>
						<LumoRadioGroup.Indicator />
					</LumoRadioGroup.Item>
				</LumoRadioGroup.Root>
			) : (
				<LumoCheckbox.Root
					aria-label={name}
					checked={checked}
					disabled={disabled}
					onCheckedChange={(next) =>
						onChange(next === true ? [...chosen, value] : chosen.filter((one) => one !== value))
					}
				>
					<LumoCheckbox.Indicator />
				</LumoCheckbox.Root>
			)}
		</Cell>
	);
}

/**
 * The chevron shares the header controls' appearance, but an open record is marked only by its turn:
 * a tint that stayed would read as a chosen row.
 */
const branchToggle = cn(
	headControl,
	iconSlot,
	'[&_svg]:transition-transform [&_svg]:duration-(--duration-state)',
	'[&[aria-expanded=true]>svg]:rotate-90',
);

export type BranchProps = {
	/** The record's own name, at the end of the indent. */
	children: ReactNode;
	/** Rows sit under this one, so the toggle is drawn. `false` keeps the space and drops the glyph. */
	hasChildren?: boolean;
	/** Whether those rows are showing. */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** What the toggle is called, after the word for the direction it leads. */
	label?: string;
	/** Merged last through `cn()`. */
	className?: string;
};

/**
 * A record's name, inset by the depth its row was given, with the control that opens what is filed
 * under it. The toggle matches a column's sort control and turns instead of filling, so
 * an open row is not read as a chosen one; a row with nothing under it keeps the space and drops the
 * glyph, which is what holds a tree's names to one line.
 */
export function Branch({
	children,
	hasChildren = true,
	open = false,
	onOpenChange,
	label,
	className,
}: BranchProps) {
	const table = use(TableContext);
	const name = label ?? textOf(children);
	const word = open ? table.locale.collapse : table.locale.expand;

	return (
		<span
			data-slot="table-branch"
			className={cn(
				'inline-flex max-w-full min-w-0 items-center gap-1.5',
				'ps-[calc(var(--table-depth,0)*var(--spacing)*6)]',
				className,
			)}
		>
			{hasChildren ? (
				<button
					type="button"
					data-slot="table-branch-toggle"
					aria-expanded={open}
					aria-label={name === undefined ? word : `${word} ${name}`}
					onClick={() => onOpenChange?.(!open)}
					className={branchToggle}
				>
					<ChevronRight />
				</button>
			) : (
				<span aria-hidden className="size-6 shrink-0" />
			)}
			<span className="min-w-0 truncate">{children}</span>
		</span>
	);
}

export type ExpandedRowProps = Omit<ComponentProps<'tr'>, 'children'> & {
	/** How many columns the panel reaches across: the whole row. */
	columns: number;
	/** How deep the record above it sits, so the panel opens under the name it belongs to. */
	depth?: number;
	children: ReactNode;
	/** Merged last through `cn()`, on the cell. */
	className?: string;
};

/**
 * The panel a record opens into. It is a row and not a box floating under one, so the table keeps its
 * columns and a reader keeps the header they were reading. Render it under the record it belongs to,
 * where the table would otherwise have gone on with the next one.
 */
export function ExpandedRow({
	columns,
	depth = 1,
	className,
	children,
	...props
}: ExpandedRowProps) {
	return (
		<tr data-slot="table-expanded" style={{ '--table-depth': depth } as CSSProperties} {...props}>
			<td
				colSpan={columns}
				className={cn(
					'border-b bg-muted/40 py-(--cell-py) pe-(--cell-px)',
					'ps-[calc(var(--cell-px)+var(--table-depth,0)*var(--spacing)*6)]',
					className,
				)}
			>
				{children}
			</td>
		</tr>
	);
}

export type EmptyProps = Omit<ComponentProps<'td'>, 'colSpan'> & {
	/** How many columns the row has to reach across to be the width of the table. */
	columns: number;
	/** A glyph over the sentence. Sized from the text around it, like every other slot. */
	icon?: ReactNode;
};

/**
 * The row a table shows when it has none. It is a row rather than a floating box, so it keeps the
 * columns — a table that emptied itself into a paragraph would take the header away from the reader
 * at the moment they most want to know what was supposed to be there.
 */
export function Empty({ columns, icon, className, children, ...props }: EmptyProps) {
	return (
		<tr data-slot="table-empty">
			<td
				data-slot="table-empty-cell"
				colSpan={columns}
				className={cn('border-b px-(--cell-px) py-12 text-center text-muted-foreground', className)}
				{...props}
			>
				<div
					data-slot="table-empty-content"
					className="mx-auto flex max-w-sm flex-col items-center gap-2"
				>
					{icon !== undefined && (
						<span data-slot="table-empty-icon" className={cn('text-2xl', iconSlot)} aria-hidden>
							{icon}
						</span>
					)}
					{children}
				</div>
			</td>
		</tr>
	);
}

export type CaptionProps = ComponentProps<'caption'>;

/** What the table is, for a reader who has not been told by the page around it. */
export function Caption({ className, ...props }: CaptionProps) {
	return (
		<caption
			data-slot="table-caption"
			className={cn('px-(--cell-px) py-(--cell-py) text-sm text-muted-foreground', className)}
			{...props}
		/>
	);
}

/** Records, in columns: the box that scrolls, the names across the top, and the rows under them. */
export const LumoTable = {
	Root,
	Header,
	Body,
	Footer,
	Row,
	Head,
	Cell,
	Caption,
	Empty,
	SelectionHead,
	SelectionCell,
	Branch,
	ExpandedRow,
};
