import { PAGE_SIZE_DEFAULT, PAGE_SIZE_OPTIONS } from '@lumo/shared';
import { Select } from '@/components/ui/form/select';
import { cn } from '@/lib/utils';
import {
	PaginationFirst,
	PaginationJump,
	PaginationLast,
	PaginationNext,
	PaginationPages,
	PaginationPrev,
	PaginationRange,
	PaginationRoot,
	type PaginationRootProps,
} from './parts';
import type { PaginationProps } from './types';

export type { PaginationProps, PaginationSlots } from '@/components/ui/data/pagination/types';
export { pagerOf, type PagerSource } from '@/components/ui/data/pagination/pager';

const PageSizes = ({
	value,
	sizes,
	size,
	disabled,
	onChange,
	className,
}: {
	value: number;
	sizes: readonly number[];
	size: PaginationRootProps['size'];
	disabled: boolean;
	onChange: (pageSize: number) => void;
	className?: string;
}) => (
	<Select
		ariaLabel="rows per page"
		size={size}
		disabled={disabled}
		className={cn('w-28', className)}
		value={value}
		options={sizes.map((count) => ({ value: count, label: `${count} / page` }))}
		onChange={(next) => {
			if (next !== null) onChange(next);
		}}
	/>
);

export const Pagination = ({
	page,
	pageCount,
	total,
	pageSize,
	items,
	onPageChange,
	onPageSizeChange,
	pageSizes = PAGE_SIZE_OPTIONS,
	size = 'md',
	siblings = 1,
	firstLast = false,
	jump = false,
	busy = false,
	range = false,
	className,
	classNames,
}: PaginationProps) => (
	<PaginationRoot
		page={page}
		pageCount={pageCount}
		total={total}
		pageSize={pageSize}
		items={items}
		onPageChange={onPageChange}
		busy={busy}
		size={size}
		className={cn(className, classNames?.root)}
	>
		{range && <PaginationRange className={cn('me-auto', classNames?.range)} />}
		{firstLast && <PaginationFirst className={classNames?.first} />}
		<PaginationPrev className={classNames?.prev} />
		<PaginationPages siblings={siblings} className={classNames?.pages} />
		<PaginationNext className={classNames?.next} />
		{firstLast && <PaginationLast className={classNames?.last} />}
		{onPageSizeChange !== undefined && (
			<PageSizes
				value={pageSize ?? pageSizes[0] ?? PAGE_SIZE_DEFAULT}
				sizes={pageSizes}
				size={size}
				disabled={busy}
				onChange={onPageSizeChange}
				className={cn('ms-1', classNames?.size)}
			/>
		)}
		{jump && <PaginationJump className={cn('ms-1', classNames?.jump)} />}
	</PaginationRoot>
);
