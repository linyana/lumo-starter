import type { RootProps } from '@/components/ui/pagination';
import type { SlotClassNames } from '../types';

export type PaginationSlots =
	| 'root'
	| 'range'
	| 'size'
	| 'first'
	| 'prev'
	| 'pages'
	| 'next'
	| 'last'
	| 'jump';

export type PaginationProps = {
	/** The page in view, counted from one. A number outside the range is clamped. */
	page: number;
	/** The number of pages, when the caller already knows it — the API answers it with every page. */
	pageCount?: number;
	total?: number;
	pageSize?: number;
	/**
	 * What the records are called, in the singular: `item` says `items`, `user` says `users`. The range
	 * only ever picks the plural, so callers never write both forms.
	 */
	items?: string;
	onPageChange?: (page: number) => void;
	/**
	 * The size a reader picked. Saying it is also what offers the choice: a row that names no setter
	 * has no box, which is the whole difference between a footer and a way through a short list.
	 */
	onPageSizeChange?: (pageSize: number) => void;
	/** The sizes offered, when the four the API accepts are not the ones to show. */
	pageSizes?: readonly number[];
	size?: RootProps['size'];
	/** How many numbers either side of the current one are kept. */
	siblings?: number;
	/**
	 * First and last, either side of the arrows — the far ends in one press each. Off by default: a
	 * footer of six arrows and a run of numbers is more to read than most lists need.
	 */
	firstLast?: boolean;
	/** Ask for a page by number. Off by default: it earns its box on a list too long to walk. */
	jump?: boolean;
	/** A read is in the air: the row keeps its place and takes no press until it lands. */
	busy?: boolean;
	/**
	 * Put the count on the start of the row: `Showing 21 - 40 from 240 items`, which is the numbers and
	 * the whole they are part of said once. Off by default — a pagination beside other controls is
	 * often one of a row and not a line of its own.
	 */
	range?: boolean;
	className?: string;
	classNames?: SlotClassNames<PaginationSlots>;
};
