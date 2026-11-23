import { Injectable } from '@nestjs/common';
import type {
	CreateUserInput,
	ListUsersQuery,
	Paginated,
	Role,
	User as WireUser,
} from '@lumo/shared';
import argon2 from 'argon2';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../common/db/prisma.service.js';
import { AppException } from '../../common/errors/app.exception.js';
import { paginate } from '../../common/pagination/index.js';
import type { UpdateUserInput } from '@lumo/shared';
import { toWireUser, userWireSelect } from './mapper/index.js';

export type UserActor = { id: string; roles: readonly Role[] };

const rolesKey = (roles: readonly string[]): string => [...new Set(roles)].sort().join(',');

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	async list(query: ListUsersQuery): Promise<Paginated<WireUser>> {
		const where: Prisma.UserWhereInput = {
			email: query.email ? { contains: query.email, mode: 'insensitive' } : undefined,
			OR: query.search
				? [
						{ email: { contains: query.search, mode: 'insensitive' } },
						{ name: { contains: query.search, mode: 'insensitive' } },
					]
				: undefined,
		};

		const orderBy = {
			[query.sort ?? 'createdAt']: query.order ?? 'desc',
		} as Prisma.UserOrderByWithRelationInput;

		const page = await paginate({
			prisma: this.prisma,
			query,
			find: ({ client, window }) =>
				client.user.findMany({
					where,
					orderBy,
					select: userWireSelect,
					...window,
				}),
			count: ({ client }) => client.user.count({ where }),
		});

		return { ...page, items: page.items.map(toWireUser) };
	}

	async getById(id: string): Promise<WireUser> {
		const row = await this.prisma.user.findUnique({ where: { id } });
		if (!row) throw new AppException('NOT_FOUND');
		return toWireUser(row);
	}

	async create(input: CreateUserInput): Promise<WireUser> {
		await this.assertEmailFree(input.email);

		const row = await this.prisma.user.create({
			data: {
				email: input.email,
				name: input.name,
				passwordHash: await argon2.hash(input.password),
				roles: input.roles,
			},
		});

		return toWireUser(row);
	}

	private async assertEmailFree(email: string): Promise<void> {
		const taken = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
		if (taken)
			throw new AppException({ code: 'CONFLICT', message: 'That email is already registered' });
	}

	async update({
		id,
		input,
		actor,
	}: {
		id: string;
		input: UpdateUserInput;
		actor: UserActor;
	}): Promise<WireUser> {
		const row = await this.prisma.user.findUnique({ where: { id } });
		if (!row) throw new AppException('NOT_FOUND');

		if (id === actor.id && rolesKey(input.roles) !== rolesKey(row.roles)) {
			throw new AppException({ code: 'FORBIDDEN', message: 'You cannot change your own roles' });
		}

		if (input.email !== row.email) await this.assertEmailFree(input.email);

		if (row.roles.includes('OWNER') && !input.roles.includes('OWNER')) {
			const owners = await this.prisma.user.count({ where: { roles: { has: 'OWNER' } } });
			if (owners <= 1) {
				throw new AppException({ code: 'FORBIDDEN', message: 'The last owner cannot be demoted' });
			}
		}

		const updated = await this.prisma.user.update({
			where: { id },
			data: { email: input.email, name: input.name, roles: input.roles },
		});

		return toWireUser(updated);
	}

	private async assertDeletable({
		client,
		ids,
	}: {
		client: Prisma.TransactionClient;
		ids: readonly string[];
	}): Promise<void> {
		const rows = await client.user.findMany({
			where: { id: { in: [...ids] } },
			select: { id: true, roles: true },
		});
		if (rows.length !== ids.length) throw new AppException('NOT_FOUND');

		const owners = rows.filter((row) => row.roles.includes('OWNER')).length;
		if (owners === 0) return;

		const live = await client.user.count({ where: { roles: { has: 'OWNER' } } });
		if (live - owners < 1) {
			throw new AppException({ code: 'FORBIDDEN', message: 'The last owner cannot be deleted' });
		}
	}

	async remove({ id }: { id: string }): Promise<void> {
		await this.removeMany({ ids: [id] });
	}

	async removeMany({ ids }: { ids: readonly string[] }): Promise<void> {
		const named = [...new Set(ids)];

		await this.prisma.$transaction(async (client) => {
			await this.assertDeletable({ client, ids: named });

			await client.user.deleteMany({ where: { id: { in: named } } });
		});
	}
}
