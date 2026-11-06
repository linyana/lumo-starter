import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	type NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { delay, type Observable } from 'rxjs';
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

	constructor(config: ConfigService) {
		this.ms = isProduction() ? 0 : (config.get<number>('API_DELAY_MS') ?? 0);
	}

	intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
		return next.handle().pipe(delay(this.ms));
	}
}
