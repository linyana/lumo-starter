import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	type NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ApiSuccess } from '@lumo/shared';
import { map, type Observable } from 'rxjs';
import { SKIP_ENVELOPE } from '../decorators/skip-envelope.decorator.js';

/**
 * Wraps successful responses in `{ data }`. Health checks opt out — a probe
 * wants the terminus payload, not an envelope around it.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiSuccess<T> | T> {
	constructor(private readonly reflector: Reflector) {}

	intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiSuccess<T> | T> {
		const skip = this.reflector.getAllAndOverride<boolean>(SKIP_ENVELOPE, [
			context.getHandler(),
			context.getClass(),
		]);

		return next.handle().pipe(map((data) => (skip ? data : { data })));
	}
}
