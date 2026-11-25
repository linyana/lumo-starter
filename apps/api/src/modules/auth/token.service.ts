import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { roleSchema, type Role } from '@lumo/shared';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../../common/db/prisma.service.js';
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL_DAYS } from '../../common/config/runtime/index.js';
import { AppException } from '../../common/errors/app.exception.js';

export type AccessClaims = {
	sub: string;
	email: string;
	roles: Role[];
};

export type IssuedTokens = {
	accessToken: string;
	refreshToken: string;
	refreshExpiresAt: Date;
};

type RefreshWriter = {
	refreshToken: {
		create(args: {
			data: { tokenHash: string; userId: string; expiresAt: Date };
		}): Promise<{ id: string }>;
	};
};

const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');

const REUSE_GRACE_MS = 30_000;

@Injectable()
export class TokenService {
	constructor(
		private readonly jwt: JwtService,
		private readonly config: ConfigService,
		private readonly prisma: PrismaService,
	) {}

	refreshTtlMs(): number {
		return REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
	}

	async issue(claims: AccessClaims): Promise<IssuedTokens> {
		const accessToken = await this.signAccess(claims);
		const refresh = await this.createRefresh({ userId: claims.sub, writer: this.prisma });
		return { accessToken, refreshToken: refresh.refreshToken, refreshExpiresAt: refresh.expiresAt };
	}

	async rotate(
		rawToken: string,
	): Promise<{ user: { id: string; email: string; roles: Role[] }; tokens: IssuedTokens }> {
		const existing = await this.prisma.refreshToken.findUnique({
			where: { tokenHash: hashToken(rawToken) },
			include: { user: true },
		});

		if (!existing)
			throw new AppException({
				code: 'UNAUTHORIZED',
				message: 'Invalid session, please sign in again',
			});

		if (existing.revokedAt) {
			const successor = existing.replacedBy
				? await this.prisma.refreshToken.findUnique({
						where: { id: existing.replacedBy },
						select: { revokedAt: true },
					})
				: null;

			const lostResponse =
				successor?.revokedAt === null &&
				Date.now() - existing.revokedAt.getTime() <= REUSE_GRACE_MS;

			if (!lostResponse) {
				await this.prisma.refreshToken.updateMany({
					where: { userId: existing.userId, revokedAt: null },
					data: { revokedAt: new Date() },
				});
				throw new AppException({
					code: 'UNAUTHORIZED',
					message: 'That session was already used, so every session was ended',
				});
			}
		}

		if (existing.expiresAt.getTime() <= Date.now())
			throw new AppException({
				code: 'UNAUTHORIZED',
				message: 'Your session expired, please sign in again',
			});

		const roles = existing.user.roles.map((role) => roleSchema.parse(role));
		const claims: AccessClaims = {
			sub: existing.user.id,
			email: existing.user.email,
			roles,
		};

		const tokens = await this.prisma.$transaction(async (tx) => {
			const created = await this.createRefresh({ userId: existing.userId, writer: tx });
			await tx.refreshToken.update({
				where: { id: existing.id },
				data: { revokedAt: existing.revokedAt ?? new Date(), replacedBy: created.id },
			});
			const accessToken = await this.signAccess(claims);
			return {
				accessToken,
				refreshToken: created.refreshToken,
				refreshExpiresAt: created.expiresAt,
			};
		});

		return { user: { id: claims.sub, email: claims.email, roles }, tokens };
	}

	async revoke(rawToken: string): Promise<void> {
		await this.prisma.refreshToken.updateMany({
			where: { tokenHash: hashToken(rawToken), revokedAt: null },
			data: { revokedAt: new Date() },
		});
	}

	private async signAccess(claims: AccessClaims): Promise<string> {
		return this.jwt.signAsync(
			{ sub: claims.sub, email: claims.email, roles: claims.roles },
			{
				secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
				expiresIn: ACCESS_TOKEN_TTL,
			},
		);
	}

	private async createRefresh({
		userId,
		writer,
	}: {
		userId: string;
		writer: RefreshWriter;
	}): Promise<{ id: string; refreshToken: string; expiresAt: Date }> {
		const refreshToken = randomBytes(48).toString('base64url');
		const expiresAt = new Date(Date.now() + this.refreshTtlMs());
		const created = await writer.refreshToken.create({
			data: { tokenHash: hashToken(refreshToken), userId, expiresAt },
		});
		return { id: created.id, refreshToken, expiresAt };
	}
}
