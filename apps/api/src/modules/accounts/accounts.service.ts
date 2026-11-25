import { Injectable } from '@nestjs/common';
import type {
	CreateAccountInput,
	ListAccountsQuery,
	Paginated,
	Role,
	Account as WireAccount,
} from '@lumo/shared';
import argon2 from 'argon2';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../common/db/prisma.service.js';
import { assertAccountFieldFree } from '../../common/db/unique/index.js';
import { AppException } from '../../common/errors/app.exception.js';
import { paginate } from '../../common/pagination/index.js';
import type { UpdateAccountInput } from '@lumo/shared';
import { toWireAccount, accountWireSelect } from './mapper/index.js';

export type AccountActor = { id: string; roles: readonly Role[] };

const rolesKey = (roles: readonly string[]): string => [...new Set(roles)].sort().join(',');

@Injectable()
export class AccountsService {
	constructor(private readonly prisma: PrismaService) {}

	async list(query: ListAccountsQuery): Promise<Paginated<WireAccount>> {
		const where: Prisma.AccountWhereInput = {
			email: query.email ? { contains: query.email, mode: 'insensitive' } : undefined,
			OR: query.search
				? [
						{ email: { contains: query.search, mode: 'insensitive' } },
						{ username: { contains: query.search, mode: 'insensitive' } },
						{ name: { contains: query.search, mode: 'insensitive' } },
					]
				: undefined,
		};

		const orderBy = {
			[query.sort ?? 'createdAt']: query.order ?? 'desc',
		} as Prisma.AccountOrderByWithRelationInput;

		const page = await paginate({
			prisma: this.prisma,
			query,
			find: ({ client, window }) =>
				client.account.findMany({
					where,
					orderBy,
					select: accountWireSelect,
					...window,
				}),
			count: ({ client }) => client.account.count({ where }),
		});

		return { ...page, items: page.items.map(toWireAccount) };
	}

	async getById(id: string): Promise<WireAccount> {
		const row = await this.prisma.account.findUnique({ where: { id } });
		if (!row) throw new AppException('NOT_FOUND');
		return toWireAccount(row);
	}

	async create(input: CreateAccountInput): Promise<WireAccount> {
		await assertAccountFieldFree({ prisma: this.prisma, field: 'email', value: input.email });
		await assertAccountFieldFree({ prisma: this.prisma, field: 'username', value: input.username });

		const row = await this.prisma.account.create({
			data: {
				email: input.email,
				username: input.username,
				name: input.name,
				passwordHash: await argon2.hash(input.password),
				roles: input.roles,
			},
		});

		return toWireAccount(row);
	}

	private async assertEmailFree(email: string): Promise<void> {
		await assertAccountFieldFree({ prisma: this.prisma, field: 'email', value: email });
	}

	private async assertUsernameFree(username: string): Promise<void> {
		await assertAccountFieldFree({ prisma: this.prisma, field: 'username', value: username });
	}

	async update({
		id,
		input,
		actor,
	}: {
		id: string;
		input: UpdateAccountInput;
		actor: AccountActor;
	}): Promise<WireAccount> {
		const row = await this.prisma.account.findUnique({ where: { id } });
		if (!row) throw new AppException('NOT_FOUND');

		if (id === actor.id && rolesKey(input.roles) !== rolesKey(row.roles)) {
			throw new AppException({ code: 'FORBIDDEN', message: 'You cannot change your own roles' });
		}

		if (input.email !== row.email) await this.assertEmailFree(input.email);
		if (input.username !== row.username) await this.assertUsernameFree(input.username);

		if (row.roles.includes('OWNER') && !input.roles.includes('OWNER')) {
			const owners = await this.prisma.account.count({ where: { roles: { has: 'OWNER' } } });
			if (owners <= 1) {
				throw new AppException({ code: 'FORBIDDEN', message: 'The last owner cannot be demoted' });
			}
		}

		const updated = await this.prisma.account.update({
			where: { id },
			data: { email: input.email, username: input.username, name: input.name, roles: input.roles },
		});

		return toWireAccount(updated);
	}

	private async assertDeletable({
		client,
		ids,
	}: {
		client: Prisma.TransactionClient;
		ids: readonly string[];
	}): Promise<void> {
		const rows = await client.account.findMany({
			where: { id: { in: [...ids] } },
			select: { id: true, roles: true },
		});
		if (rows.length !== ids.length) throw new AppException('NOT_FOUND');

		const owners = rows.filter((row) => row.roles.includes('OWNER')).length;
		if (owners === 0) return;

		const live = await client.account.count({ where: { roles: { has: 'OWNER' } } });
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

			await client.account.deleteMany({ where: { id: { in: named } } });
		});
	}
}
