import { Injectable } from '@nestjs/common';
import type {
	AuthResult,
	LoginInput,
	PatchProfileInput,
	RegisterInput,
	Session,
} from '@lumo/shared';
import argon2 from 'argon2';
import { PrismaService } from '../../common/db/prisma.service.js';
import { assertUserFieldFree } from '../../common/db/unique/index.js';
import { AppException } from '../../common/errors/app.exception.js';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { replaceAssignments, roleByKey } from '../roles/assignments/index.js';
import { toWireUser } from '../users/mapper/index.js';
import { workspaceWireSelect, toWireWorkspace } from '../workspaces/mapper/index.js';
import { TokenService, type IssuedTokens } from './token.service.js';

type AuthenticatedResult = AuthResult & { tokens: IssuedTokens };

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly tokens: TokenService,
		private readonly authorization: AuthorizationService,
	) {}

	async register(input: RegisterInput): Promise<AuthenticatedResult> {
		await assertUserFieldFree({ prisma: this.prisma, field: 'email', value: input.email });
		await assertUserFieldFree({ prisma: this.prisma, field: 'username', value: input.username });

		const passwordHash = await argon2.hash(input.password);

		const created = await this.prisma.$transaction(async (tx) => {
			const user = await tx.user.create({
				data: {
					email: input.email,
					username: input.username,
					name: input.name,
					passwordHash,
				},
			});

			const workspace = await tx.workspace.create({
				data: { slug: input.username, name: input.username },
			});

			const membership = await tx.membership.create({
				data: { userId: user.id, workspaceId: workspace.id },
			});

			const owner = await roleByKey({ client: tx, workspaceId: workspace.id, key: 'OWNER' });

			await replaceAssignments({
				client: tx,
				membershipId: membership.id,
				roleIds: [owner.id],
			});

			return { user, workspace };
		});

		return this.authenticate({ userId: created.user.id, workspaceId: created.workspace.id });
	}

	async login(input: LoginInput): Promise<AuthenticatedResult> {
		const row = await this.prisma.user.findUnique({ where: { email: input.email } });

		if (!row)
			throw new AppException({ code: 'UNAUTHORIZED', message: 'Incorrect email or password' });

		const valid = await argon2.verify(row.passwordHash, input.password);
		if (!valid)
			throw new AppException({ code: 'UNAUTHORIZED', message: 'Incorrect email or password' });

		const membership = await this.prisma.membership.findFirst({
			where: { userId: row.id },
			orderBy: { createdAt: 'asc' },
			select: { workspaceId: true },
		});

		if (!membership)
			throw new AppException({
				code: 'FORBIDDEN',
				message: 'You are not a member of any workspace',
			});

		return this.authenticate({ userId: row.id, workspaceId: membership.workspaceId });
	}

	async refresh(rawToken: string): Promise<AuthenticatedResult> {
		const { userId, workspaceId, tokens } = await this.tokens.rotate(rawToken);
		const session = await this.session({ userId, workspaceId });

		return { ...session, accessToken: tokens.accessToken, tokens };
	}

	async switchWorkspace({
		userId,
		workspaceId,
	}: {
		userId: string;
		workspaceId: string;
	}): Promise<AuthenticatedResult> {
		const membership = await this.prisma.membership.findUnique({
			where: { userId_workspaceId: { userId, workspaceId } },
			select: { id: true },
		});

		if (!membership) throw new AppException('NOT_FOUND');

		return this.authenticate({ userId, workspaceId });
	}

	async logout(rawToken: string): Promise<void> {
		await this.tokens.revoke(rawToken);
	}

	async session({
		userId,
		workspaceId,
	}: {
		userId: string;
		workspaceId: string;
	}): Promise<Session> {
		const actor = await this.authorization.resolveActor({ userId, workspaceId });

		if (!actor)
			throw new AppException({
				code: 'FORBIDDEN',
				message: 'You are not a member of that workspace',
			});

		const memberships = await this.prisma.membership.findMany({
			where: { userId },
			select: { workspace: { select: workspaceWireSelect } },
			orderBy: { createdAt: 'asc' },
		});

		const workspace = memberships
			.map((membership) => membership.workspace)
			.find((candidate) => candidate.id === workspaceId);

		if (!workspace) throw new AppException('NOT_FOUND');

		return {
			user: toWireUser({ row: actor, roles: actor.roles }),
			permissions: actor.permissions,
			workspace: toWireWorkspace(workspace),
			workspaces: memberships.map((membership) => toWireWorkspace(membership.workspace)),
		};
	}

	async updateProfile({
		userId,
		workspaceId,
		input,
	}: {
		userId: string;
		workspaceId: string;
		input: PatchProfileInput;
	}): Promise<Session['user']> {
		const row = await this.prisma.user.findUnique({ where: { id: userId } });
		if (!row) throw new AppException('NOT_FOUND');

		if (input.email !== undefined && input.email !== row.email)
			await assertUserFieldFree({ prisma: this.prisma, field: 'email', value: input.email });

		if (input.username !== undefined && input.username !== row.username)
			await assertUserFieldFree({ prisma: this.prisma, field: 'username', value: input.username });

		await this.prisma.user.update({
			where: { id: userId },
			data: { username: input.username, email: input.email, name: input.name },
		});

		const session = await this.session({ userId, workspaceId });
		return session.user;
	}

	private async authenticate({
		userId,
		workspaceId,
	}: {
		userId: string;
		workspaceId: string;
	}): Promise<AuthenticatedResult> {
		const tokens = await this.tokens.issue({ userId, workspaceId });
		const session = await this.session({ userId, workspaceId });

		return { ...session, accessToken: tokens.accessToken, tokens };
	}
}
