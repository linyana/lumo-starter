import type { RootProps } from '@/components/ui/pagination';
import type { SlotClassNames } from '../types';

export type PaginationSlots = 'root' | 'prev' | 'pages' | 'next';

export type PaginationProps = {
	/** The page in view, counted from one. A number outside the range is clamped. */
	page: number;
	/** The number of pages, when the caller already knows it. */
	pageCount?: number;
	total?: number;
	pageSize?: number;
	onPageChange?: (page: number) => void;
	size?: RootProps['size'];
	/** How many numbers either side of the current one are kept. */
	siblings?: number;
	className?: string;
	classNames?: SlotClassNames<PaginationSlots>;
};
