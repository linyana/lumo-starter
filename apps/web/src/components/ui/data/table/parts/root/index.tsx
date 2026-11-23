import { useMemo, useRef, type ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { Spinner } from '@/components/ui/feedback/spinner';
import { cn } from '@/lib/utils';
import { defaultLocale, TableContext, useTableLayout } from '../context';

export type TableSort = 'ascending' | 'descending' | 'none';

export const defaultSortDirections: TableSort[] = ['ascending', 'descending'];

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
	loading?: string;
};

export type TableScroll = {
	x?: number | string;
	y?: number | string;
};

export function syncScroll(box: HTMLElement) {
	const rest = box.scrollWidth - box.clientWidth - box.scrollLeft;
	const mark = ({ name, on }: { name: string; on: boolean }) => {
		if (on === box.hasAttribute(name)) return;
		if (on) box.setAttribute(name, '');
		else box.removeAttribute(name);
	};
	mark({ name: 'data-scrolled-start', on: box.scrollLeft > 1 });
	mark({ name: 'data-scrolled-end', on: rest > 1 });
}

const fixedOffset = '--table-fixed-offset';

export function place({ cell, offset }: { cell: HTMLTableCellElement; offset: number }) {
	const value = `${offset}px`;
	if (cell.style.getPropertyValue(fixedOffset) !== value)
		cell.style.setProperty(fixedOffset, value);
}

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
		className?: string;
		scroll?: TableScroll;
		hoverable?: boolean;
		sortDirections?: TableSort[];
		locale?: TableLocale;
		layout?: 'auto' | 'fixed';
		waiting?: boolean;
	};

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
							'absolute inset-x-0 bottom-0 top-(--table-head-height,0px) z-20',
							'grid place-items-center bg-background/30 text-muted-foreground',
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
