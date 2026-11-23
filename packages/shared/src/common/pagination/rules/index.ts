import { PAGE_SIZE_DEFAULT } from '../constants';

export const pageCountOf = ({
	total,
	pageSize = PAGE_SIZE_DEFAULT,
}: {
	total: number;
	pageSize?: number;
}): number => Math.max(1, Math.ceil(total / Math.max(1, pageSize)));

export const clampPage = ({ page, pageCount }: { page: number; pageCount: number }): number =>
	Math.min(Math.max(Math.trunc(page) || 1, 1), Math.max(1, pageCount));
