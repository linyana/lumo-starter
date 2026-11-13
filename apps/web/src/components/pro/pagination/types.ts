import type { RootProps } from '@/components/ui/pagination';
import type { SlotClassNames } from '../types';

export type PaginationSlots = 'root' | 'range' | 'prev' | 'pages' | 'next';

export type PaginationProps = {
	/** The page in view, counted from one. A number outside the range is clamped. */
	page: number;
	/** The number of pages, when the caller already knows it. */
	pageCount?: number;
	total?: number;
	pageSize?: number;
	/**
	 * What the records are called, in the singular: `item` says `items`, `user` says `users`. The range
	 * only ever picks the plural, so callers never write both forms.
	 */
	items?: string;
	onPageChange?: (page: number) => void;
	size?: RootProps['size'];
	/** How many numbers either side of the current one are kept. */
	siblings?: number;
	/**
	 * Put the count on the start of the row: `Showing 21 - 40 from 240 items`, which is the numbers and
	 * the whole they are part of said once. Off by default — a pagination beside other controls is
	 * often one of a row and not a line of its own.
	 */
	range?: boolean;
	className?: string;
	classNames?: SlotClassNames<PaginationSlots>;
};
