import { LumoPagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import type { PaginationProps } from './types';

export type { PaginationProps, PaginationSlots } from './types';

/**
 * Which page of the records you are on, and the way to another. Given `range`, the row also says how
 * many records there are in all — on the start, with the way through them on the end.
 */
export const Pagination = ({
	page,
	pageCount,
	total,
	pageSize,
	onPageChange,
	size = 'md',
	siblings = 1,
	range = false,
	className,
	classNames,
}: PaginationProps) => (
	<LumoPagination.Root
		page={page}
		pageCount={pageCount}
		total={total}
		pageSize={pageSize}
		onPageChange={onPageChange}
		size={size}
		className={cn(className, classNames?.root)}
	>
		{/* Its own line is made by pushing everything after it to the end, so the two halves of the row
		    are one flex line wherever the component is put. */}
		{range && <LumoPagination.Range className={cn('me-auto', classNames?.range)} />}
		<LumoPagination.Prev className={classNames?.prev} />
		<LumoPagination.Pages siblings={siblings} className={classNames?.pages} />
		<LumoPagination.Next className={classNames?.next} />
	</LumoPagination.Root>
);
