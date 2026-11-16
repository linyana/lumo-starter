import { pageCountOf, type Paginated, type Pagination } from '@lumo/shared';
import type { Prisma } from '../../generated/prisma/client.js';
import type { PrismaService } from '../db/prisma.service.js';

/**
 * One page of a list: the slice of it the page asks for, and the envelope it is answered with.
 *
 * Every list endpoint asks the same three things — which rows, cut where, and how many there are in
 * all — so the arithmetic is written here once instead of once per resource. The two reads are
 * handed to `$transaction` as the delegates build them, so they are one round trip and one answer:
 * a count that ran after a write would tell the reader about a page the other half had just
 * rearranged.
 *
 * ```ts
 * return paginate({
 * 	prisma: this.prisma,
 * 	query,
 * 	find: (window) => this.prisma.user.findMany({ where, orderBy, ...window }),
 * 	count: () => this.prisma.user.count({ where }),
 * });
 * ```
 */
export const paginate = async <Row>({
	prisma,
	query,
	find,
	count,
}: {
	prisma: PrismaService;
	/** The window asked for: which page, and how large. */
	query: Pagination;
	/** The rows of one page, given the window to read them in. */
	find: (window: { skip: number; take: number }) => Prisma.PrismaPromise<Row[]>;
	/** How many rows the same narrowing matches in all. */
	count: () => Prisma.PrismaPromise<number>;
}): Promise<Paginated<Row>> => {
	const window = { skip: (query.page - 1) * query.pageSize, take: query.pageSize };
	const [items, total] = await prisma.$transaction([find(window), count()]);

	return {
		items,
		page: query.page,
		pageSize: query.pageSize,
		pageCount: pageCountOf({ total, pageSize: query.pageSize }),
		total,
	};
};
