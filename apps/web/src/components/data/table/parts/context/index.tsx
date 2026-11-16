import { createContext, useEffect, useLayoutEffect, type RefObject } from 'react';
import type { TableFixed } from '../head';
import {
	defaultSortDirections,
	place,
	syncScroll,
	type TableLocale,
	type TableSort,
} from '../root';

export const defaultLocale: Required<TableLocale> = {
	sortAscending: 'Sort ascending',
	sortDescending: 'Sort descending',
	cancelSort: 'Clear sorting',
	filter: 'Filter',
	selectAll: 'Select every row',
	selectNone: 'Select nothing',
	selectInvert: 'Invert the selection',
	selectOptions: 'Selection options',
	expand: 'Expand',
	collapse: 'Collapse',
	loading: 'Loading',
};

export /**
 * Two settings a part cannot be told individually: the cycle a press walks and the words the table
 * speaks. Both are table-wide by nature — a column with its own cycle would make two headers count
 * differently — so they come from the root and a column may still override the cycle.
 */
const TableContext = createContext<{
	sortDirections: TableSort[];
	locale: Required<TableLocale>;
}>({ sortDirections: defaultSortDirections, locale: defaultLocale });

export /** Whether the header a title cell belongs to holds still, which is what makes that cell sticky. */
const HeaderContext = createContext<{ sticky: boolean } | null>(null);

/** The column at the inner end of a run of pinned columns is the one that casts the shadow. */
function markEdge({ cell, edge }: { cell: HTMLTableCellElement; edge: TableFixed | undefined }) {
	if (edge === undefined) {
		if (cell.hasAttribute('data-fixed-edge')) cell.removeAttribute('data-fixed-edge');
		return;
	}
	if (cell.getAttribute('data-fixed-edge') !== edge) cell.setAttribute('data-fixed-edge', edge);
}

/**
 * The three things a table cannot be told from its own markup: how far each pinned column is from
 * the edge it is pinned to, how far down each sticky header row starts, and how tall the band of
 * titles is — which is where the records begin, and so where a wait over them begins as well.
 *
 * All three are measured from the cells, which is why a column only has to name an edge instead of
 * an offset, and why a grouped header stacks without anyone adding up row heights. The widths are
 * the layout's own — `offsetWidth`, not the rectangle a transform ancestor or a zoom would report —
 * and every write is compared first, so a render that changes nothing costs one pass and no
 * invalidation.
 */
function measureTable({
	element,
	box,
	root,
}: {
	element: HTMLTableElement;
	box: HTMLElement;
	/** The frame around both, which is where a wait's layer reads the title band's height from. */
	root: HTMLElement;
}) {
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

	const band = `${head?.offsetHeight ?? 0}px`;
	if (root.style.getPropertyValue('--table-head-height') !== band) {
		root.style.setProperty('--table-head-height', band);
	}

	syncScroll(box);
}

export /**
 * Runs the measurement after every render, because a new row is a new set of cells to place, and
 * again on a resize of either the table or its frame, which changes widths without rendering.
 */
function useTableLayout(root: RefObject<HTMLDivElement | null>) {
	useLayoutEffect(() => {
		const element = root.current?.querySelector('table');
		const box = root.current?.querySelector<HTMLElement>('[data-slot="table-container"]');
		if (!root.current || !element || !box) return;
		measureTable({ element, box, root: root.current });
	});

	useEffect(() => {
		const frame = root.current;
		const element = frame?.querySelector('table');
		const box = frame?.querySelector<HTMLElement>('[data-slot="table-container"]');
		if (!frame || !element || !box) return;
		const observer = new ResizeObserver(() => measureTable({ element, box, root: frame }));
		observer.observe(element);
		observer.observe(box);
		return () => observer.disconnect();
	}, [root]);
}
