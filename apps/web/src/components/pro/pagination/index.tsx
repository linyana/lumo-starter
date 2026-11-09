import { LumoPagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import type { PaginationProps } from './types';

/** Which page of the records you are on, and the way to another. */
export const Pagination = ({
	page,
	pageCount,
	total,
	pageSize,
	onPageChange,
	size = 'md',
	siblings = 1,
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
		<LumoPagination.Prev className={classNames?.prev} />
		<LumoPagination.Pages siblings={siblings} className={classNames?.pages} />
		<LumoPagination.Next className={classNames?.next} />
	</LumoPagination.Root>
);
