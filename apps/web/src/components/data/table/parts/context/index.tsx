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

export const TableContext = createContext<{
	sortDirections: TableSort[];
	locale: Required<TableLocale>;
}>({ sortDirections: defaultSortDirections, locale: defaultLocale });

export const HeaderContext = createContext<{ sticky: boolean } | null>(null);

function markEdge({ cell, edge }: { cell: HTMLTableCellElement; edge: TableFixed | undefined }) {
	if (edge === undefined) {
		if (cell.hasAttribute('data-fixed-edge')) cell.removeAttribute('data-fixed-edge');
		return;
	}
	if (cell.getAttribute('data-fixed-edge') !== edge) cell.setAttribute('data-fixed-edge', edge);
}

function measureTable({
	element,
	box,
	root,
}: {
	element: HTMLTableElement;
	box: HTMLElement;
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

export function useTableLayout(root: RefObject<HTMLDivElement | null>) {
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
