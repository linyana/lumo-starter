import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	type NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { delay, type Observable } from 'rxjs';
import { SKIP_DELAY } from '../decorators/skip-delay.decorator.js';
import { isProduction } from '../config/runtime/index.js';

/**
 * Holds every response back by `API_DELAY_MS`. Spinners, skeletons and empty
 * states are invisible against a local API that answers in two milliseconds, so
 * the delay is what a frontend test asks for; nothing else in the app changes.
 *
 * Zero is off, and production is always zero: the knob exists to slow a
 * developer's machine down, never a deployment.
 */
@Injectable()
export class DelayInterceptor implements NestInterceptor {
	private readonly ms: number;

	constructor(
		config: ConfigService,
		private readonly reflector: Reflector,
	) {
		this.ms = isProduction() ? 0 : (config.get<number>('API_DELAY_MS') ?? 0);
	}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const skip = this.reflector.getAllAndOverride<boolean>(SKIP_DELAY, [
			context.getHandler(),
			context.getClass(),
		]);

		return next.handle().pipe(delay(skip ? 0 : this.ms));
	}
}
