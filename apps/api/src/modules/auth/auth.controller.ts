import { Controller, Cookies, Get, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from '@lumo/shared';
import type { NodeResponse } from '@nestjs/platform-node';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { SkipEnvelope } from '../../common/decorators/skip-envelope.decorator.js';
import { AppException } from '../../common/errors/app.exception.js';
import { ZodBody } from '../../common/pipes/zod-validation.pipe.js';
import { ApiZodBody } from '../../common/swagger/zod-openapi/index.js';
import type { AuthUser } from '../../common/types/index.js';
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
		this.attachRefreshCookie(res, result.tokens);
		return { accessToken: result.tokens.accessToken, user: result.user };
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
		this.attachRefreshCookie(res, result.tokens);
		return { accessToken: result.tokens.accessToken, user: result.user };
	}

	/**
	 * The access token lives in memory on the client, so a page reload always
	 * starts here: the refresh cookie is the only durable credential.
	 */
	@Public()
	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	async refresh(
		@Cookies(REFRESH_COOKIE) raw: string | undefined,
		@Res({ passthrough: true }) res: NodeResponse,
	) {
		if (!raw) throw new AppException('UNAUTHORIZED');

		const result = await this.auth.refresh(raw);
		this.attachRefreshCookie(res, result.tokens);
		return { accessToken: result.tokens.accessToken, user: result.user };
	}

	/** Public on purpose: an expired access token must not trap the user signed in. */
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
	async me(@CurrentUser() user: AuthUser) {
		return { user: await this.auth.me(user.id) };
	}

	private attachRefreshCookie(res: NodeResponse, tokens: IssuedTokens): void {
		setRefreshCookie(res, tokens.refreshToken, tokens.refreshExpiresAt);
	}
}
