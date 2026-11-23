import { clampPage, pageCountOf, type Paginated, type Pagination } from '@lumo/shared';
import type { Prisma } from '../../generated/prisma/client.js';
import type { PrismaService } from '../db/prisma.service.js';

const windowOf = ({ page, pageSize }: Pagination): { skip: number; take: number } => ({
	skip: (page - 1) * pageSize,
	take: pageSize,
});

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
	const [total, rows] = await prisma.$transaction([
		count({ client: prisma }),
		find({ client: prisma, window: windowOf(query) }),
	]);

	const pageCount = pageCountOf({ total, pageSize: query.pageSize });
	const page = clampPage({ page: query.page, pageCount });

	const items =
		page === query.page
			? rows
			: await find({ client: prisma, window: windowOf({ ...query, page }) });

	return { items, page, pageSize: query.pageSize, pageCount, total };
};
