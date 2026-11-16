import { useMemo, useRef, type ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { Spinner } from '@/components/feedback/spinner';
import { cn } from '@/lib/utils';
import { defaultLocale, TableContext, useTableLayout } from '../context';

/**
 * How a column is sorted, in the words `aria-sort` already uses. `undefined` is a column that
 * cannot be sorted, which is not the same as `none` — one is a fact about the layout, the other is
 * an invitation.
 */
export type TableSort = 'ascending' | 'descending' | 'none';

export /**
 * The cycle a sortable column walks, and the same list in `TableHead.sortDirections`. It ends where
 * `aria-sort` has no word for it: the press after the last direction stops sorting, because a
 * reader who has tried both ways wants the order they were given, not the first one again.
 */
const defaultSortDirections: TableSort[] = ['ascending', 'descending'];

/** The words the table says on its own. Anything left out falls back to English. */
export type TableLocale = {
	sortAscending?: string;
	sortDescending?: string;
	cancelSort?: string;
	filter?: string;
	selectAll?: string;
	selectNone?: string;
	selectInvert?: string;
	selectOptions?: string;
	expand?: string;
	collapse?: string;
	/** What a wait over the records is called, said under the ring and read out at once. */
	loading?: string;
};

/** The two ways a table leaves its frame: sideways when it is wider than it was given room for. */
export type TableScroll = {
	/** A floor on the table's own width, so the frame scrolls instead of squeezing the columns. */
	x?: number | string;
	/** A ceiling on the frame's height, so the records scroll under the header. */
	y?: number | string;
};

export /**
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

export function place({ cell, offset }: { cell: HTMLTableCellElement; offset: number }) {
	const value = `${offset}px`;
	if (cell.style.getPropertyValue(fixedOffset) !== value)
		cell.style.setProperty(fixedOffset, value);
}

/**
 * Frameless by default so records can sit inside a Card or panel. Standalone tables can choose
 * an outlined or filled surface; neither adds a grid between the columns.
 *
 * Two measurements, inherited by every part. `--cell-py` and `--cell-px` are the whole density of
 * the table: a head, a cell and the empty state are all inset by them, so the size variant is the
 * only knob and a part added later is drawn at it without being told to be.
 *
 * The border model is `separate` rather than `collapse`, because a collapsed border belongs to the table
 * and scrolls with it — a sticky header drawn that way loses its bottom rule the moment it sticks. So the
 * line under a row is drawn by each of its cells instead, as a layer, in the hairline of spacing the
 * table keeps between two rows: a border is part of the box it belongs to and bends with that box's
 * corners, and a row whose colour is round still ends on a straight line.
 */
/**
 * The two insets the table is drawn at, as classes. Exported because the footer is drawn outside the
 * frame the variables are set on: a pagination under a table lines up with the columns above it only
 * if it is inset by the same measurements, so the block that holds both sets them once.
 */
export const tableDensity = {
	sm: '[--cell-px:--spacing(3)] [--cell-py:--spacing(2)]',
	md: '[--cell-px:--spacing(4)] [--cell-py:--spacing(3)]',
	lg: '[--cell-px:--spacing(5)] [--cell-py:--spacing(4)]',
} as const;

export const tableVariants = tv({
	base: [
		'min-w-0 w-full overflow-auto text-sm',
		'[&>table:has(>tfoot)>tbody>tr:last-child>*]:after:hidden',
	],
	variants: {
		size: tableDensity,
		variant: {
			borderless: '',
			outlined: [
				'rounded-lg border bg-card text-card-foreground [--table-surface:var(--card)]',
				'[&>table>tbody>tr:last-child>*]:after:hidden',
			],
			filled: [
				'rounded-lg bg-muted [--table-surface:var(--muted)]',
				'[&>table>tbody>tr:last-child>*]:after:hidden',
			],
		},
	},
	defaultVariants: {
		size: 'md',
		variant: 'borderless',
	},
});

export type TableRootProps = Omit<ComponentProps<'table'>, 'className'> &
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
		/**
		 * `fixed` gives every column the width it was declared, which is what `ellipsis` needs: an
		 * automatic layout decides widths from the content it is asked to cut off.
		 */
		layout?: 'auto' | 'fixed';
		/**
		 * The records are being fetched again. They stay where they are — what the last answer said is
		 * still worth reading — under a scrim that reaches from under the titles to the frame's own
		 * bottom edge, with the ring in the middle of exactly that box.
		 *
		 * The band of titles is deliberately outside it: it names what the wait is about and does not
		 * change with its answer, so a wait that covered it would be moving a reader's own bearings
		 * around. A table being read for the first time has nothing to keep, and shows placeholders
		 * instead — the caller's choice, since only the caller knows which of the two it is.
		 */
		waiting?: boolean;
	};

/**
 * A table of records. The frame scrolls, so a table wider than its column is read sideways rather
 * than squeezed; the table inside it keeps the semantics, which is the half of this component the
 * browser already knew how to do.
 */
export function TableRoot({
	size = 'md',
	variant = 'borderless',
	hoverable = true,
	layout = 'auto',
	sortDirections = defaultSortDirections,
	locale,
	scroll,
	waiting = false,
	className,
	style,
	children,
	...props
}: TableRootProps) {
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
						// A hairline of the table's own between two rows, which is where the rule under a record
						// stands: the line fills that space, so taking it away leaves the space rather than closing
						// it — a row that is arrived at lifts off its neighbours instead of losing a line.
						className="w-full border-separate border-spacing-x-0 border-spacing-y-px caption-bottom"
						{...props}
					>
						{children}
					</table>
				</div>
				{waiting && (
					<div
						data-slot="table-wait"
						className={cn(
							// From under the titles to the frame's bottom edge: the box that is actually answering.
							'absolute inset-x-0 bottom-0 top-(--table-head-height,0px) z-20',
							'grid place-items-center bg-background/30 text-muted-foreground',
							// Its top edge falls mid-frame, so only the corners the frame rounds are rounded.
							variant !== 'borderless' && 'rounded-b-lg',
						)}
					>
						<Spinner label={value.locale.loading} caption={value.locale.loading} />
					</div>
				)}
			</div>
		</TableContext>
	);
}
