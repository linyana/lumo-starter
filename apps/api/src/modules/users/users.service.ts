import { Injectable } from '@nestjs/common';
import type { ListUsersQuery, Paginated, Role, User as WireUser } from '@lumo/shared';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../common/db/prisma.service.js';
import { AppException } from '../../common/errors/app.exception.js';
import type { UpdateUserInput } from '@lumo/shared';
import { toWireUser } from './mapper/index.js';

export type UserActor = { id: string; roles: readonly Role[] };

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	async list(query: ListUsersQuery): Promise<Paginated<WireUser>> {
		const where: Prisma.UserWhereInput = query.search
			? {
					OR: [
						{ email: { contains: query.search, mode: 'insensitive' } },
						{ name: { contains: query.search, mode: 'insensitive' } },
					],
				}
			: {};

		// The sort key is a closed union in the shared schema, so this cast cannot
		// be reached with arbitrary column names from the query string.
		const orderBy = { [query.sort]: query.order } as Prisma.UserOrderByWithRelationInput;

		const [rows, total] = await this.prisma.$transaction([
			this.prisma.user.findMany({
				where,
				orderBy,
				skip: (query.page - 1) * query.pageSize,
				take: query.pageSize,
			}),
			this.prisma.user.count({ where }),
		]);

		return {
			items: rows.map(toWireUser),
			page: query.page,
			pageSize: query.pageSize,
			total,
		};
	}

	async getById(id: string): Promise<WireUser> {
		const row = await this.prisma.user.findUnique({ where: { id } });
		if (!row) throw new AppException('NOT_FOUND');
		return toWireUser(row);
	}

	async update(id: string, input: UpdateUserInput, actor: UserActor): Promise<WireUser> {
		if (input.roles && id === actor.id) {
			throw new AppException({ code: 'FORBIDDEN', message: 'You cannot change your own roles' });
		}

		const row = await this.prisma.user.findUnique({ where: { id } });
		if (!row) throw new AppException('NOT_FOUND');

		// Never let the last owner lose the role: the app would be unadministrable.
		if (input.roles && !input.roles.includes('OWNER')) {
			const owners = await this.prisma.user.count({ where: { roles: { has: 'OWNER' } } });
			if (owners <= 1 && row.roles.includes('OWNER')) {
				throw new AppException({ code: 'FORBIDDEN', message: 'The last owner cannot be demoted' });
			}
		}

		const updated = await this.prisma.user.update({
			where: { id },
			data: {
				...(input.name === undefined ? {} : { name: input.name }),
				...(input.roles === undefined ? {} : { roles: input.roles }),
			},
		});

		return toWireUser(updated);
	}

	async remove(id: string, actor: UserActor): Promise<void> {
		if (id === actor.id) {
			throw new AppException({ code: 'FORBIDDEN', message: 'You cannot delete your own account' });
		}

		const row = await this.prisma.user.findUnique({ where: { id }, select: { roles: true } });
		if (!row) throw new AppException('NOT_FOUND');

		if (row.roles.includes('OWNER')) {
			const owners = await this.prisma.user.count({ where: { roles: { has: 'OWNER' } } });
			if (owners <= 1) {
				throw new AppException({ code: 'FORBIDDEN', message: 'The last owner cannot be deleted' });
			}
		}

		// Refresh tokens cascade (onDelete: Cascade), so the session dies with the user.
		await this.prisma.user.delete({ where: { id } });
	}
}
