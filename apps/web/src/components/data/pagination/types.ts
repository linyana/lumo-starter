import type { SlotClassNames } from '@/components/types';
import type { PaginationRootProps } from './parts';

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
	page: number;
	pageCount?: number;
	total?: number;
	pageSize?: number;
	items?: string;
	onPageChange?: (page: number) => void;
	onPageSizeChange?: (pageSize: number) => void;
	pageSizes?: readonly number[];
	size?: PaginationRootProps['size'];
	siblings?: number;
	firstLast?: boolean;
	jump?: boolean;
	busy?: boolean;
	range?: boolean;
	className?: string;
	classNames?: SlotClassNames<PaginationSlots>;
};
