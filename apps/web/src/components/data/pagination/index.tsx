import { PAGE_SIZE_DEFAULT, PAGE_SIZE_OPTIONS } from '@lumo/shared';
import { Select } from '@/components/form/select';
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

export type { PaginationProps, PaginationSlots } from '@/components/data/pagination/types';

/**
 * How many records a page holds: the one control in the row that is a field, because it is a choice
 * among numbers rather than a way through them — and it is the library's own `Select`, so the popup,
 * the caret and the keyboard are the ones every other choice on a screen already has.
 */
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
	/** A read is in the air: the box keeps its place and opens nothing. */
	disabled: boolean;
	onChange: (pageSize: number) => void;
	className?: string;
}) => (
	<Select<string>
		ariaLabel="rows per page"
		size={size}
		disabled={disabled}
		className={cn('w-28', className)}
		value={String(value)}
		// A select holds strings; the page holds a number, and it is a number on the wire as well.
		options={sizes.map((count) => ({ value: String(count), label: `${count} / page` }))}
		onChange={(next) => {
			if (next !== null) onChange(Number(next));
		}}
		clearable={false}
	/>
);

/**
 * Which page of the records you are on, and the way to another. Given `range`, the row also says how
 * many records there are in all — on the start, with the way through them on the end. Given
 * `onPageSizeChange` it also offers the sizes, and given `jump` the box a page can be asked for by
 * number: the two things a long list needs that a short one is better without.
 */
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
		{/* The count takes the slack after itself, so everything that follows it is pushed to the end: what
		    the page holds reads on the start and the controls that belong to it sit together on the end. */}
		{range && <PaginationRange className={cn('me-auto', classNames?.range)} />}
		{firstLast && <PaginationFirst className={classNames?.first} />}
		<PaginationPrev className={classNames?.prev} />
		<PaginationPages siblings={siblings} className={classNames?.pages} />
		<PaginationNext className={classNames?.next} />
		{firstLast && <PaginationLast className={classNames?.last} />}
		{/* The size after the way through, the asked-for page last: a setting of the list comes before the
		    one box that is typed into, and both are a step further from the numbers than they are from
		    each other, so a field is not read as another control of the run. */}
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
