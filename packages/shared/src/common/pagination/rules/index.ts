import { PAGE_SIZE_DEFAULT } from '../constants';

/**
 * How many pages a total makes at a page size, and never fewer than one: an empty list still has a
 * first page, so every screen that draws a way through its records would otherwise special-case the
 * answer that has nothing to page through. The API writes this into the envelope it answers with, so
 * a client reads the count it was given instead of deriving a second one that can disagree.
 */
export const pageCountOf = ({
	total,
	pageSize = PAGE_SIZE_DEFAULT,
}: {
	total: number;
	pageSize?: number;
}): number => Math.max(1, Math.ceil(total / Math.max(1, pageSize)));

/**
 * The page a reader may be on: counted from one, and never past the last. A query string they typed,
 * the last record of the last page just deleted and a page size picked under them all arrive here as
 * the same question — "that page is gone" — and are answered the same way.
 */
export const clampPage = ({ page, pageCount }: { page: number; pageCount: number }): number =>
	Math.min(Math.max(Math.trunc(page) || 1, 1), Math.max(1, pageCount));
