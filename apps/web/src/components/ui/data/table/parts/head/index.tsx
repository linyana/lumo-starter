import { ArrowDown, ArrowUp, ArrowUpDown, ListFilter } from 'lucide-react';
import { use, useState, type ComponentProps, type MouseEvent, type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import type { ListFilter as ListFilterProps } from '@/hooks';
import {
	PopoverPopup,
	PopoverPortal,
	PopoverPositioner,
	PopoverRoot,
	PopoverTrigger,
} from '@/components/ui/overlay/popover/parts';
import {
	TooltipPopup,
	TooltipPortal,
	TooltipPositioner,
	TooltipRoot,
	TooltipTrigger,
} from '@/components/ui/overlay/tooltip/parts';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';
import { fixedRowStates } from '../cell';
import { HeaderContext, TableContext } from '../context';
import type { TableLocale, TableSort } from '../root';

export type TableFilterProps = ListFilterProps;

export const textOf = (node: ReactNode) =>
	typeof node === 'string' || typeof node === 'number' ? String(node) : undefined;

export type TableFixed = 'start' | 'end';

const breakpoints = ['sm', 'md', 'lg', 'xl', '2xl'] as const;

export type TableBreakpoint = (typeof breakpoints)[number];

const responsiveDisplay: Record<TableBreakpoint, string> = {
	sm: 'hidden sm:table-cell',
	md: 'hidden md:table-cell',
	lg: 'hidden lg:table-cell',
	xl: 'hidden xl:table-cell',
	'2xl': 'hidden 2xl:table-cell',
};

export function responsiveClass(responsive: TableBreakpoint[] | undefined) {
	if (responsive === undefined) return undefined;
	const first = breakpoints.find((one) => responsive.includes(one));
	return first === undefined ? 'hidden' : responsiveDisplay[first];
}

const fixedShadow = cn(
	'transition-shadow duration-(--duration-state)',
	'[[data-scrolled-start]_&[data-fixed-edge=start]]:shadow-[inset_-8px_0_8px_-8px_var(--color-border)]',
	'[[data-scrolled-end]_&[data-fixed-edge=end]]:shadow-[inset_8px_0_8px_-8px_var(--color-border)]',
);

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

export function fixedClass(fixed: TableFixed | undefined) {
	if (fixed === undefined) return undefined;
	return cn(
		'sticky bg-[var(--table-surface,var(--layout-content))]',
		fixed === 'start'
			? 'left-[var(--table-fixed-offset,0px)]'
			: 'right-[var(--table-fixed-offset,0px)]',
		fixedRowStates,
		fixedShadow,
	);
}

const rowRule = cn(
	'after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-border',
	'[[data-slot=table-container][data-hoverable=true]>table>tbody>tr:hover>&]:after:opacity-0',
	'[[data-slot=table-container][data-hoverable=true]>table>tbody>tr:has(+_tr:hover)>&]:after:opacity-0',
	'[tr[data-selected]>&]:after:opacity-0',
	'[tr:has(+_tr[data-selected])>&]:after:opacity-0',
);

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

export const ellipsisCell = 'max-w-[var(--cell-max-w,15rem)] overflow-hidden text-ellipsis';

export const rowCellEnds = '[&:first-child]:rounded-s-lg [&:last-child]:rounded-e-lg';

export const headControl = cn(
	'relative inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md',
	'text-muted-foreground transition-colors duration-(--duration-state)',
	'hover:bg-row-hover hover:text-foreground',
	'data-active:bg-row-hover data-active:text-foreground',
	'data-popup-open:bg-row-hover data-popup-open:text-foreground',
	'before:absolute before:-inset-1.5',
);

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

export type TableHeadProps = Omit<ComponentProps<'th'>, 'align'> &
	VariantProps<typeof tableCellVariants> & {
		sort?: TableSort;
		onSort?: (next: TableSort | undefined) => void;
		sortDirections?: TableSort[];
		filter?: TableFilterProps;
		fixed?: TableFixed;
		responsive?: TableBreakpoint[];
		ellipsis?: boolean | { showTitle?: boolean };
	};

function SortArrow({ sort }: { sort: TableSort }) {
	if (sort === 'ascending') return <ArrowUp />;
	if (sort === 'descending') return <ArrowDown />;

	return <ArrowUpDown />;
}

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
