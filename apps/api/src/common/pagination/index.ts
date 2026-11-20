import { clampPage, pageCountOf, type Paginated, type Pagination } from '@lumo/shared';
import type { Prisma } from '../../generated/prisma/client.js';
import type { PrismaService } from '../db/prisma.service.js';

/**
 * One page of a list: the slice of it the page asks for, and the envelope it is answered with.
 *
 * Every list endpoint asks the same three things — how many rows there are in all, which page of
 * them to read, and the rows of that page — so the arithmetic is written here once instead of once
 * per resource. The count comes first because the window cannot be cut before it is known: a page
 * past the last one is answered by the last one there is, and the envelope names the page that was
 * read rather than the one that was asked for.
 *
 * The two reads are not wrapped in a transaction. One would not make them a single view: at READ
 * COMMITTED the count and the page are two snapshots either way. What it would add is a pooled
 * connection held across the round trip, and Prisma's transaction timeout as one more way for a
 * plain read to fail while the pool is busy.
 *
 * ```ts
 * return paginate({
 * 	prisma: this.prisma,
 * 	query,
 * 	find: ({ client, window }) => client.user.findMany({ where, orderBy, ...window }),
 * 	count: ({ client }) => client.user.count({ where }),
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
	/** The rows of one page. */
	find: (args: {
		client: PrismaService;
		window: { skip: number; take: number };
	}) => Prisma.PrismaPromise<Row[]>;
	/** How many rows the same narrowing matches in all. */
	count: (args: { client: PrismaService }) => Prisma.PrismaPromise<number>;
}): Promise<Paginated<Row>> => {
	const total = await count({ client: prisma });
	const pageCount = pageCountOf({ total, pageSize: query.pageSize });
	const page = clampPage({ page: query.page, pageCount });

	const items = await find({
		client: prisma,
		window: { skip: (page - 1) * query.pageSize, take: query.pageSize },
	});

	return { items, page, pageSize: query.pageSize, pageCount, total };
};
