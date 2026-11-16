import { ChevronRight } from 'lucide-react';
import { use, type ReactNode } from 'react';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';
import { TableContext } from '../context';
import { headControl, textOf } from '../head';

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

export type TableBranchProps = {
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
export function TableBranch({
	children,
	hasChildren = true,
	open = false,
	onOpenChange,
	label,
	className,
}: TableBranchProps) {
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
