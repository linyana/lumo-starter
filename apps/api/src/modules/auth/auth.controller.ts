import { Controller, Cookies, Get, HttpCode, HttpStatus, Patch, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
	loginSchema,
	patchProfileSchema,
	registerSchema,
	type LoginInput,
	type PatchProfileInput,
	type RegisterInput,
} from '@lumo/shared';
import type { NodeResponse } from '@nestjs/platform-node';
import { CurrentAccount } from '../../common/decorators/current-account.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { SkipEnvelope } from '../../common/decorators/skip-envelope.decorator.js';
import { AppException } from '../../common/errors/app.exception.js';
import { ZodBody } from '../../common/pipes/zod-validation.pipe.js';
import { ApiZodBody } from '../../common/swagger/zod-openapi/index.js';
import type { AuthAccount } from '../../common/types/index.js';
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
		return { accessToken: result.tokens.accessToken, account: result.account };
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
		return { accessToken: result.tokens.accessToken, account: result.account };
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
		return { accessToken: result.tokens.accessToken, account: result.account };
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

	@Get('me')
	async me(@CurrentAccount() account: AuthAccount) {
		return { account: await this.auth.me(account.id) };
	}

	@Patch('me')
	@ApiZodBody(patchProfileSchema)
	async updateMe(
		@CurrentAccount() account: AuthAccount,
		@ZodBody(patchProfileSchema) input: PatchProfileInput,
	) {
		return { account: await this.auth.updateProfile({ accountId: account.id, input }) };
	}

	private attachRefreshCookie({ res, tokens }: { res: NodeResponse; tokens: IssuedTokens }): void {
		setRefreshCookie({ res, token: tokens.refreshToken, expiresAt: tokens.refreshExpiresAt });
	}
}
