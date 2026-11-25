import { Controller, Cookies, Get, HttpCode, HttpStatus, Patch, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
	loginSchema,
	patchProfileSchema,
	registerSchema,
	switchWorkspaceSchema,
	type AuthResult,
	type LoginInput,
	type PatchProfileInput,
	type RegisterInput,
	type SwitchWorkspaceInput,
} from '@lumo/shared';
import type { NodeResponse } from '@nestjs/platform-node';
import { AuthenticatedOnly } from '../../common/decorators/authenticated-only.decorator.js';
import { CurrentActor } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { SkipEnvelope } from '../../common/decorators/skip-envelope.decorator.js';
import { AppException } from '../../common/errors/app.exception.js';
import { ZodBody } from '../../common/pipes/zod-validation.pipe.js';
import { ApiZodBody } from '../../common/swagger/zod-openapi/index.js';
import type { AuthActor } from '../../common/types/index.js';
import { AuthService } from './auth.service.js';
import { REFRESH_COOKIE, clearRefreshCookie, setRefreshCookie } from './refresh-cookie/index.js';
import type { IssuedTokens } from './token.service.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly auth: AuthService) {}

	@Public()
	@Post('register')
	@ApiZodBody(registerSchema)
	async register(
		@ZodBody(registerSchema) input: RegisterInput,
		@Res({ passthrough: true }) res: NodeResponse,
	) {
		const result = await this.auth.register(input);
		this.attachRefreshCookie({ res, tokens: result.tokens });
		return this.toWireResult(result);
	}

	@Public()
	@Post('login')
	@HttpCode(HttpStatus.OK)
	@ApiZodBody(loginSchema)
	async login(
		@ZodBody(loginSchema) input: LoginInput,
		@Res({ passthrough: true }) res: NodeResponse,
	) {
		const result = await this.auth.login(input);
		this.attachRefreshCookie({ res, tokens: result.tokens });
		return this.toWireResult(result);
	}

	@Public()
	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	async refresh(
		@Cookies(REFRESH_COOKIE) raw: string | undefined,
		@Res({ passthrough: true }) res: NodeResponse,
	) {
		if (!raw) throw new AppException('UNAUTHORIZED');

		const result = await this.auth.refresh(raw);
		this.attachRefreshCookie({ res, tokens: result.tokens });
		return this.toWireResult(result);
	}

	@AuthenticatedOnly()
	@Post('switch-workspace')
	@HttpCode(HttpStatus.OK)
	@ApiZodBody(switchWorkspaceSchema)
	async switchWorkspace(
		@CurrentActor() actor: AuthActor,
		@ZodBody(switchWorkspaceSchema) input: SwitchWorkspaceInput,
		@Res({ passthrough: true }) res: NodeResponse,
	) {
		const result = await this.auth.switchWorkspace({
			userId: actor.id,
			workspaceId: input.workspaceId,
		});
		this.attachRefreshCookie({ res, tokens: result.tokens });
		return this.toWireResult(result);
	}

	@Public()
	@Post('logout')
	@HttpCode(HttpStatus.NO_CONTENT)
	@SkipEnvelope()
	async logout(
		@Cookies(REFRESH_COOKIE) raw: string | undefined,
		@Res({ passthrough: true }) res: NodeResponse,
	): Promise<void> {
		if (raw) await this.auth.logout(raw);
		clearRefreshCookie(res);
	}

	@AuthenticatedOnly()
	@Get('me')
	async me(@CurrentActor() actor: AuthActor) {
		return this.auth.session({ userId: actor.id, workspaceId: actor.workspaceId });
	}

	@AuthenticatedOnly()
	@Patch('me')
	@ApiZodBody(patchProfileSchema)
	async updateMe(
		@CurrentActor() actor: AuthActor,
		@ZodBody(patchProfileSchema) input: PatchProfileInput,
	) {
		return {
			user: await this.auth.updateProfile({
				userId: actor.id,
				workspaceId: actor.workspaceId,
				input,
			}),
		};
	}

	private toWireResult({ accessToken, user, permissions, workspace, workspaces }: AuthResult) {
		return { accessToken, user, permissions, workspace, workspaces };
	}

	private attachRefreshCookie({ res, tokens }: { res: NodeResponse; tokens: IssuedTokens }): void {
		setRefreshCookie({ res, token: tokens.refreshToken, expiresAt: tokens.refreshExpiresAt });
	}
}
