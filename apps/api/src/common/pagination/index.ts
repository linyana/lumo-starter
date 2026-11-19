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
	/** The rows of one page, read through the transaction the count was taken in. */
	find: (args: {
		client: Prisma.TransactionClient;
		window: { skip: number; take: number };
	}) => Prisma.PrismaPromise<Row[]>;
	/** How many rows the same narrowing matches in all. */
	count: (args: { client: Prisma.TransactionClient }) => Prisma.PrismaPromise<number>;
}): Promise<Paginated<Row>> =>
	// One transaction, so a write landing between the count and the read cannot tell the reader
	// about a page the other half had just rearranged.
	prisma.$transaction(async (client) => {
		const total = await count({ client });
		const pageCount = pageCountOf({ total, pageSize: query.pageSize });
		const page = clampPage({ page: query.page, pageCount });

		const items = await find({
			client,
			window: { skip: (page - 1) * query.pageSize, take: query.pageSize },
		});

		return { items, page, pageSize: query.pageSize, pageCount, total };
	});
