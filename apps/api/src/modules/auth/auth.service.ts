import { Injectable } from '@nestjs/common';
import type {
	AuthResult,
	LoginInput,
	PatchProfileInput,
	RegisterInput,
	Account as WireAccount,
} from '@lumo/shared';
import argon2 from 'argon2';
import { decodeRoles } from '../../common/db/codec/index.js';
import { PrismaService } from '../../common/db/prisma.service.js';
import { assertAccountFieldFree } from '../../common/db/unique/index.js';
import { AppException } from '../../common/errors/app.exception.js';
import { toWireAccount } from '../accounts/mapper/index.js';
import { TokenService, type IssuedTokens } from './token.service.js';

type AuthenticatedResult = AuthResult & { tokens: IssuedTokens };

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly tokens: TokenService,
	) {}

	async register(input: RegisterInput): Promise<AuthenticatedResult> {
		await assertAccountFieldFree({ prisma: this.prisma, field: 'email', value: input.email });
		await assertAccountFieldFree({ prisma: this.prisma, field: 'username', value: input.username });

		const passwordHash = await argon2.hash(input.password);

		const isFirstAccount = (await this.prisma.account.count()) === 0;

		const row = await this.prisma.account.create({
			data: {
				email: input.email,
				username: input.username,
				name: input.name,
				passwordHash,
				roles: isFirstAccount ? ['OWNER'] : ['MEMBER'],
			},
		});

		const account = toWireAccount(row);
		const tokens = await this.tokens.issue({
			sub: row.id,
			email: row.email,
			roles: decodeRoles(row.roles),
		});

		return { accessToken: tokens.accessToken, account, tokens };
	}

	async login(input: LoginInput): Promise<AuthenticatedResult> {
		const row = await this.prisma.account.findUnique({ where: { email: input.email } });

		if (!row)
			throw new AppException({ code: 'UNAUTHORIZED', message: 'Incorrect email or password' });

		const valid = await argon2.verify(row.passwordHash, input.password);
		if (!valid)
			throw new AppException({ code: 'UNAUTHORIZED', message: 'Incorrect email or password' });

		const account = toWireAccount(row);
		const tokens = await this.tokens.issue({
			sub: row.id,
			email: row.email,
			roles: decodeRoles(row.roles),
		});

		return { accessToken: tokens.accessToken, account, tokens };
	}

	async refresh(rawToken: string): Promise<{ account: WireAccount; tokens: IssuedTokens }> {
		const { account, tokens } = await this.tokens.rotate(rawToken);
		const row = await this.prisma.account.findUnique({ where: { id: account.id } });
		if (!row)
			throw new AppException({ code: 'UNAUTHORIZED', message: 'Your account no longer exists' });

		return { account: toWireAccount(row), tokens };
	}

	async logout(rawToken: string): Promise<void> {
		await this.tokens.revoke(rawToken);
	}

	async me(accountId: string): Promise<WireAccount> {
		const row = await this.prisma.account.findUnique({ where: { id: accountId } });
		if (!row) throw new AppException('NOT_FOUND');
		return toWireAccount(row);
	}

	async updateProfile({
		accountId,
		input,
	}: {
		accountId: string;
		input: PatchProfileInput;
	}): Promise<WireAccount> {
		const row = await this.prisma.account.findUnique({ where: { id: accountId } });
		if (!row) throw new AppException('NOT_FOUND');

		if (input.email !== undefined && input.email !== row.email)
			await assertAccountFieldFree({ prisma: this.prisma, field: 'email', value: input.email });

		if (input.username !== undefined && input.username !== row.username)
			await assertAccountFieldFree({
				prisma: this.prisma,
				field: 'username',
				value: input.username,
			});

		const updated = await this.prisma.account.update({
			where: { id: accountId },
			data: { username: input.username, email: input.email, name: input.name },
		});

		return toWireAccount(updated);
	}
}
