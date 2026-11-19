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
import { toWireUser } from './mapper/index.js';

export type UserActor = { id: string; roles: readonly Role[] };

/**
 * Roles read as a set: a pick made twice is the pick that was already there, and the same picks in
 * another order are the same answer.
 */
const rolesKey = (roles: readonly string[]): string => [...new Set(roles)].sort().join(',');

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	async list(query: ListUsersQuery): Promise<Paginated<WireUser>> {
		// Two ways to narrow, and they add up: `search` reads the name or the address, `email` only the
		// address. Prisma leaves an `undefined` out of the clause, so the query is one object rather
		// than one object per combination of the two.
		const where: Prisma.UserWhereInput = {
			email: query.email ? { contains: query.email, mode: 'insensitive' } : undefined,
			OR: query.search
				? [
						{ email: { contains: query.search, mode: 'insensitive' } },
						{ name: { contains: query.search, mode: 'insensitive' } },
					]
				: undefined,
		};

		const page = await paginate({
			prisma: this.prisma,
			query,
			// The sort key is a closed union in the shared schema, so the cast cannot be reached with an
			// arbitrary column name from the query string.
			find: ({ client, window }) =>
				client.user.findMany({
					where,
					orderBy: { [query.sort]: query.order } as Prisma.UserOrderByWithRelationInput,
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

	/** One email holds one account, so the unique index is asked before it is hit. */
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

		// A roles field the reader cannot edit still travels with the form, so the rule reads the value
		// that arrived rather than its presence.
		if (
			id === actor.id &&
			input.roles !== undefined &&
			rolesKey(input.roles) !== rolesKey(row.roles)
		) {
			throw new AppException({ code: 'FORBIDDEN', message: 'You cannot change your own roles' });
		}

		if (input.email !== undefined && input.email !== row.email) {
			await this.assertEmailFree(input.email);
		}

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
				...(input.email === undefined ? {} : { email: input.email }),
				...(input.name === undefined ? {} : { name: input.name }),
				...(input.roles === undefined ? {} : { roles: input.roles }),
			},
		});

		return toWireUser(updated);
	}

	/**
	 * The rules one account has to pass to be deleted: not the reader's own, and not the last owner. They
	 * live here, once, because a batch is the same question asked about more rows — and a batch that
	 * answered differently from a row would be a second set of rules to keep in step.
	 */
	private async assertDeletable({
		client,
		ids,
		actor,
	}: {
		client: Prisma.TransactionClient;
		ids: readonly string[];
		actor: UserActor;
	}): Promise<void> {
		if (ids.includes(actor.id)) {
			throw new AppException({ code: 'FORBIDDEN', message: 'You cannot delete your own account' });
		}

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

	async remove({ id, actor }: { id: string; actor: UserActor }): Promise<void> {
		await this.removeMany({ ids: [id], actor });
	}

	/**
	 * The same question about a screenful: the rows are read and asked about once, and the delete happens
	 * once — so a row that may not go takes none of the others with it.
	 *
	 * The same id twice is one row, and the answer is about the rows that were named, so the duplicates
	 * are dropped before anything is counted.
	 */
	async removeMany({ ids, actor }: { ids: readonly string[]; actor: UserActor }): Promise<void> {
		const named = [...new Set(ids)];

		await this.prisma.$transaction(async (client) => {
			await this.assertDeletable({ client, ids: named, actor });

			// Refresh tokens cascade (onDelete: Cascade), so the session dies with the user.
			await client.user.deleteMany({ where: { id: { in: named } } });
		});
	}
}
