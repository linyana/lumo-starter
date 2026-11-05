import { Injectable } from '@nestjs/common';
import type { AuthResult, LoginInput, RegisterInput, User as WireUser } from '@lumo/shared';
import argon2 from 'argon2';
import { decodeRoles } from '../../common/db/codec/index.js';
import { PrismaService } from '../../common/db/prisma.service.js';
import { AppException } from '../../common/errors/app.exception.js';
import { toWireUser } from '../users/mapper/index.js';
import { TokenService, type IssuedTokens } from './token.service.js';

type AuthenticatedResult = AuthResult & { tokens: IssuedTokens };

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly tokens: TokenService,
	) {}

	async register(input: RegisterInput): Promise<AuthenticatedResult> {
		const taken = await this.prisma.user.findUnique({
			where: { email: input.email },
			select: { id: true },
		});
		if (taken)
			throw new AppException({ code: 'CONFLICT', message: 'That email is already registered' });

		const passwordHash = await argon2.hash(input.password);

		// Bootstrap: whoever registers into an empty table owns it. Every later
		// sign-up is a plain member until an owner promotes them.
		const isFirstUser = (await this.prisma.user.count()) === 0;

		const row = await this.prisma.user.create({
			data: {
				email: input.email,
				name: input.name,
				passwordHash,
				roles: isFirstUser ? ['OWNER'] : ['MEMBER'],
			},
		});

		const user = toWireUser(row);
		const tokens = await this.tokens.issue({
			sub: row.id,
			email: row.email,
			roles: decodeRoles(row.roles),
		});

		return { accessToken: tokens.accessToken, user, tokens };
	}

	async login(input: LoginInput): Promise<AuthenticatedResult> {
		const row = await this.prisma.user.findUnique({ where: { email: input.email } });

		// Same error for "no such user" and "wrong password": distinguishing them
		// turns the login form into an account enumeration oracle.
		if (!row)
			throw new AppException({ code: 'UNAUTHORIZED', message: 'Incorrect email or password' });

		const valid = await argon2.verify(row.passwordHash, input.password);
		if (!valid)
			throw new AppException({ code: 'UNAUTHORIZED', message: 'Incorrect email or password' });

		const user = toWireUser(row);
		const tokens = await this.tokens.issue({
			sub: row.id,
			email: row.email,
			roles: decodeRoles(row.roles),
		});

		return { accessToken: tokens.accessToken, user, tokens };
	}

	async refresh(rawToken: string): Promise<{ user: WireUser; tokens: IssuedTokens }> {
		const { user, tokens } = await this.tokens.rotate(rawToken);
		const row = await this.prisma.user.findUnique({ where: { id: user.id } });
		if (!row)
			throw new AppException({ code: 'UNAUTHORIZED', message: 'Your account no longer exists' });

		return { user: toWireUser(row), tokens };
	}

	async logout(rawToken: string): Promise<void> {
		await this.tokens.revoke(rawToken);
	}

	async me(userId: string): Promise<WireUser> {
		const row = await this.prisma.user.findUnique({ where: { id: userId } });
		if (!row) throw new AppException('NOT_FOUND');
		return toWireUser(row);
	}
}
