import type { PaginationProps } from './types';

export type PagerSource = {
	page: number;
	pageCount?: number;
	total?: number;
	pageSize?: number;
	setPage?: (page: number) => void;
	setPageSize?: (pageSize: number) => void;
	wait?: 'opening' | 'refreshing' | null;
};

export function pagerOf(source: PagerSource): PaginationProps;
export function pagerOf(source: PagerSource | undefined): PaginationProps | undefined;
export function pagerOf(source: PagerSource | undefined): PaginationProps | undefined {
	if (source === undefined) return undefined;

	return {
		page: source.page,
		pageCount: source.pageCount,
		total: source.total,
		pageSize: source.pageSize,
		onPageChange: source.setPage,
		onPageSizeChange: source.setPageSize,
		busy: (source.wait ?? null) !== null,
	};
}
