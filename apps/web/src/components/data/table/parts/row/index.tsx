import type { ComponentProps, CSSProperties } from 'react';
import { tv } from 'tailwind-variants';
import { cn } from '@/lib/utils';

/**
 * Two fills, and they are not the same fill. The pointer leaves a wash of the text colour, gone a
 * frame after it passes; a chosen row leaves a tint of `primary`, which in this theme is also a
 * near-black and so has to be mixed a step stronger to still be there once the pointer has left.
 *
 * Neither is drawn here, because a table row is not a box the browser rounds and a fill with no corners
 * is a fill a row cannot show as its own: both are drawn by the cells instead, in `rowCellWash`. What
 * is left here belongs to the row alone — what an unavailable row gives up.
 */
export const tableRowVariants = tv({
	base: [
		// A row that cannot be acted on is out of the way rather than hidden: the records around it
		// are still true, so it keeps its place and its text, and loses its answers.
		'data-disabled:pointer-events-none data-disabled:opacity-50',
	],
});

export type TableRowProps = ComponentProps<'tr'> & {
	/**
	 * How deep the record sits under the one above it. It is written as `--table-depth`, which
	 * `TableBranch` insets by, so a tree reads as a tree and a row keeps one class at every level.
	 */
	depth?: number;
};

/** One record. */
export function TableRow({ depth, className, style, ...props }: TableRowProps) {
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

export /**
 * The colour of a row, on the boxes that make it — see `tableRowVariants` for why it is not on the row.
 * The transition is here for the same reason: the wash changes when the pointer arrives, and a pinned
 * cell paints the same wash a layer down, so the two can only arrive together if they take the same
 * time to.
 */
const rowCellWash = cn(
	'transition-colors duration-(--duration-state)',
	'[[data-slot=table-container][data-hoverable=true]>table>tbody>tr:not([data-selected]):hover>&]:bg-row-hover',
	// A row keeps the pointer's wash while its menu is up, and the menu is the host's to open.
	'[tr[data-menu-open]>&]:bg-row-hover',
	'[tr[data-selected]>&]:bg-row-selected',
	'[[data-slot=table-container][data-hoverable=true]>table>tbody>tr[data-selected]:hover>&]:bg-row-selected-hover',
);
