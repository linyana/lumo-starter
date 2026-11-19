import { ArrowDown, ArrowUp, ArrowUpDown, ListFilter } from 'lucide-react';
import { use, useState, type ComponentProps, type MouseEvent, type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import {
	PopoverPopup,
	PopoverPortal,
	PopoverPositioner,
	PopoverRoot,
	PopoverTrigger,
} from '@/components/overlay/popover/parts';
import {
	TooltipPopup,
	TooltipPortal,
	TooltipPositioner,
	TooltipRoot,
	TooltipTrigger,
} from '@/components/overlay/tooltip/parts';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';
import { fixedRowStates } from '../cell';
import { HeaderContext, TableContext } from '../context';
import type { TableLocale, TableSort } from '../root';

/**
 * A column narrowed by one control. The table owns everything about how that is asked — the icon in
 * the title, the popup, where it lands, the room the control is drawn in, the focus it opens with,
 * and the reader's way out — and the caller owns the control itself: one `Field`, bound the way
 * every other field is, narrowing the column by being in it.
 *
 * ```tsx
 * filter: {
 *   field: <Field name="email"><Input placeholder="Exact email" /></Field>,
 *   active: users.filters.email !== undefined,
 *   clear: () => users.clearFilter('email'),
 * }
 * ```
 */
export type TableFilterProps = {
	/** The control itself. A field, not a panel: no popup, no chrome, no padding of its own. */
	field: ReactNode;
	/**
	 * Whether this column is narrowed now. The caller's answer, because the value is the caller's: it
	 * tints the icon and offers the way out in the column's menu.
	 */
	active?: boolean;
	/** The way back to an unnarrowed column — the menu line that offers it. Left out, there is none. */
	clear?: () => void;
	/** Merged onto the popup, for a wider panel or a taller one — never for the panel's own room. */
	className?: string;
};

export const textOf = (node: ReactNode) =>
	typeof node === 'string' || typeof node === 'number' ? String(node) : undefined;

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

export /**
 * A column appears from the smallest breakpoint it names, which is how the list reads: the screen has
 * to be at least that wide. An empty list is a column that is never shown.
 */
function responsiveClass(responsive: TableBreakpoint[] | undefined) {
	if (responsive === undefined) return undefined;
	const first = breakpoints.find((one) => responsive.includes(one));
	return first === undefined ? 'hidden' : responsiveDisplay[first];
}

/**
 * The shadow of a pinned column, cast past its inner edge and only while something is passing under
 * it: the frame says which edges still have content behind them, and the last pinned column of a run is
 * the only one that draws it.
 *
 * It is the cell's shadow rather than a layer beside it, because the layers of a cell are spoken for —
 * one is the row's colour and one is the rule under the row — and an inset shadow is the same picture
 * without one.
 */
const fixedShadow = cn(
	'transition-shadow duration-(--duration-state)',
	'[[data-scrolled-start]_&[data-fixed-edge=start]]:shadow-[inset_-8px_0_8px_-8px_var(--color-border)]',
	'[[data-scrolled-end]_&[data-fixed-edge=end]]:shadow-[inset_8px_0_8px_-8px_var(--color-border)]',
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

export /** What a column pinned to an edge is drawn with, whether it is a title or a cell. */
function fixedClass(fixed: TableFixed | undefined) {
	if (fixed === undefined) return undefined;
	// The fill is what hides the columns scrolling under the pinned one, and it has to be the surface the
	// table is actually on. A variant that owns a surface names it; a borderless table sits on the page's
	// content area, which is a tone of its own and not the page's chrome — filling with `--background`
	// there leaves a band of the wrong colour down the edge. A table drawn on a card of its own is
	// `variant="outlined"`, or a wrapper that sets `--table-surface`: the component cannot read a
	// surface it was not told about.
	return cn(
		'sticky bg-[var(--table-surface,var(--layout-content))]',
		fixed === 'start'
			? 'left-[var(--table-fixed-offset,0px)]'
			: 'right-[var(--table-fixed-offset,0px)]',
		fixedRowStates,
		fixedShadow,
	);
}

/**
 * The line under a row, drawn by each of its cells as a layer of its own. A border is part of the box it
 * belongs to, so a cell with a rounded corner bends its rule with it — the line would lift at the two
 * ends of a row and nowhere else. A layer is not clipped, so the rule stays straight under a row whose
 * colour is round.
 *
 * A row that is arrived at — the pointer's or the reader's — takes its own line with it and the line it
 * sits under as well: a colour that is round and a rule that stops at it are two pictures of one block,
 * and a line drawn across either edge would be the third. The hairline the line stood in stays, so the
 * block sits a hair off what it left behind rather than touching it.
 */
const rowRule = cn(
	'after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-border',
	'[[data-slot=table-container][data-hoverable=true]>table>tbody>tr:hover>&]:after:hidden',
	'[[data-slot=table-container][data-hoverable=true]>table>tbody>tr:has(+_tr:hover)>&]:after:hidden',
	'[tr[data-selected]>&]:after:hidden',
	'[tr:has(+_tr[data-selected])>&]:after:hidden',
);

/**
 * What every column is drawn with: the inset, the rule under it, and which edge its text is set
 * from. A header and a cell are the same box — one names the column and one fills it — so both are
 * built from this, and a column set from the end reads as one line from its name to its last figure.
 *
 * Figures are tabular everywhere, not only in a column set from the end, because the digits in a
 * cell are usually being compared with the digits in the cell above it.
 */
export const tableCellVariants = tv({
	base: [
		'relative px-(--cell-px) py-(--cell-py) align-middle whitespace-nowrap tabular-nums',
		rowRule,
	],
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

export /** One line, cut off at the column's width. `--cell-max-w` is how far a column may run. */
const ellipsisCell = 'max-w-[var(--cell-max-w,15rem)] overflow-hidden text-ellipsis';

export /**
 * The two ends of a row, and the only two cells that can be a corner: a row is rounded where it starts
 * and where it ends, never between two of its own cells — a radius on every cell would notch the rule
 * at every column boundary instead of rounding the row's edges.
 */
const rowCellEnds = '[&:first-child]:rounded-s-lg [&:last-child]:rounded-e-lg';

export /**
 * A control in a column title: one 24px square holding one glyph, tinted while the pointer is on it
 * and tinted again, kept, while its column is sorted or filtered. The sort arrow and the filter icon
 * are the same control, so a reader learns one shape and reads both.
 *
 * The tint is painted on the square; the pointer is taken from a wider invisible box, so a header can
 * hold two of these a gap apart without their targets merging.
 *
 * Three things leave the tint behind, and all three are the same tint: the pointer resting on the
 * square, the reader having opened the panel behind it, and the column being sorted or narrowed. The
 * second is not the first lasting longer — once the pointer is in the panel, the trigger is no longer
 * pointed at, and a square that dropped back would leave the open panel with nothing saying which
 * control it came from. Base UI writes that flag on every trigger; the sort arrow never carries it.
 *
 * The ink is the same at every state, so the two glyphs read as one control: a title that can be
 * sorted and one that can be narrowed sit beside each other, and neither is the quieter of the two.
 */
const headControl = cn(
	'relative inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md',
	'text-muted-foreground transition-colors duration-(--duration-state)',
	'hover:bg-row-hover hover:text-foreground',
	'data-active:bg-row-hover data-active:text-foreground',
	'data-popup-open:bg-row-hover data-popup-open:text-foreground',
	'before:absolute before:-inset-1.5',
);

/**
 * The panel behind a header's filter icon: the caller's control, in the table's panel. The room
 * around it, the focus it opens with and the way the reader says they are done are the panel's — a
 * control is handed in, not a popup — so a screen never has to know how a filter is asked for.
 *
 * Enter is the reader saying so: what was typed has already been handed over, and the press would
 * otherwise reach the form as a submit — which is not what a filter bar has to offer.
 */
function FilterPanel({ filter, onClose }: { filter: TableFilterProps; onClose: () => void }) {
	return (
		<div
			data-slot="table-filter-panel"
			className="p-2"
			onKeyDown={(event) => {
				if (event.key !== 'Enter' || !(event.target instanceof HTMLInputElement)) return;

				event.preventDefault();
				onClose();
			}}
		>
			{filter.field}
		</div>
	);
}

/**
 * The filter icon in a column's title, and the popup it opens. It is tinted while the column is
 * narrowed, which is the only sign of an applied filter once the panel is closed.
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

	return (
		<PopoverRoot open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				data-slot="table-filter"
				data-active={filter.active === true ? '' : undefined}
				aria-label={label === undefined ? locale.filter : `${locale.filter} ${label}`}
				className={cn(headControl, iconSlot)}
			>
				<ListFilter />
			</PopoverTrigger>
			<PopoverPortal>
				<PopoverPositioner sideOffset={6} align="end">
					<PopoverPopup className={cn('w-60 p-0', filter.className)}>
						<FilterPanel filter={filter} onClose={() => setOpen(false)} />
					</PopoverPopup>
				</PopoverPositioner>
			</PopoverPortal>
		</PopoverRoot>
	);
}

/**
 * A column's title. Its own props are the three things a title knows about its column — how it is
 * sorted, how it is narrowed, where it is pinned — and everything else is a `<th>`'s. A right press is
 * one of those: `onContextMenu` lands on the cell itself, which is where a menu about the column is
 * opened from, and the press is the caller's to prevent, anchor and fill.
 */
export type TableHeadProps = Omit<ComponentProps<'th'>, 'align'> &
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
		/**
		 * A filter panel behind an icon beside the title, drawn by the caller: a `Field` around the
		 * control that narrows this column. The pressed state is the caller's too, because the value is.
		 */
		filter?: TableFilterProps;
		/**
		 * Pin the column to an edge of the frame, so it stays readable while the rest scrolls under it.
		 * The offset is measured from the columns beside it; nothing has to be declared beyond the edge.
		 */
		fixed?: TableFixed;
		/** Show the column from a breakpoint up. Give the same list to its `TableCell`s. */
		responsive?: TableBreakpoint[];
		/** Cut the title off at the column's width, and keep the whole of it in `title`. */
		ellipsis?: boolean | { showTitle?: boolean };
	};

/** The direction the arrow points. Unsorted is the two-headed one, so the column still says it can move. */
function SortArrow({ sort }: { sort: TableSort }) {
	if (sort === 'ascending') return <ArrowUp />;
	if (sort === 'descending') return <ArrowDown />;

	return <ArrowUpDown />;
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
export function TableHead({
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
}: TableHeadProps) {
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
	const filtered = filter?.active === true;
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
				className={cn(headControl, iconSlot)}
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
				// A title holds still at the top of the frame and a pinned one at its edge as well. The
				// pinned column stands in front of the rest, so it is drawn above the other titles — and
				// only a title may be given the top, since a pinned record still has to scroll away.
				(fixed !== undefined || holds) && 'sticky',
				holds && 'top-(--table-head-top,0px)',
				layerOf({ fixed, inHead: header !== null, holds }),
				rowCellEnds,
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
		<TooltipRoot>
			<TooltipTrigger render={cell} />
			<TooltipPortal>
				<TooltipPositioner>
					<TooltipPopup>{hint}</TooltipPopup>
				</TooltipPositioner>
			</TooltipPortal>
		</TooltipRoot>
	);
}
