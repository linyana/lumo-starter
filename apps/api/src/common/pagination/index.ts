import { clampPage, pageCountOf, type Paginated, type Pagination } from '@lumo/shared';
import type { Prisma } from '../../generated/prisma/client.js';
import type { PrismaService } from '../db/prisma.service.js';

export const paginate = async <Row>({
	prisma,
	query,
	find,
	count,
}: {
	prisma: PrismaService;
	query: Pagination;
	find: (args: {
		client: PrismaService;
		window: { skip: number; take: number };
	}) => Prisma.PrismaPromise<Row[]>;
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
