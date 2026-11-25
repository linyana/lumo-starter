import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { AUTHENTICATED_ONLY_KEY } from '../decorators/authenticated-only.decorator.js';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

type ControllerInstance = { instance: object; metatype?: unknown };
type RouteTargets = [Function, Function];

const declaresAccess = ({
	reflector,
	targets,
}: {
	reflector: Reflector;
	targets: RouteTargets;
}): boolean =>
	reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets) === true ||
	reflector.getAllAndOverride<boolean>(AUTHENTICATED_ONLY_KEY, targets) === true ||
	(reflector.getAllAndOverride<unknown[]>(PERMISSIONS_KEY, targets)?.length ?? 0) > 0;

@Injectable()
export class RouteAccessAudit implements OnApplicationBootstrap {
	private readonly logger = new Logger(RouteAccessAudit.name);

	constructor(
		private readonly discovery: DiscoveryService,
		private readonly scanner: MetadataScanner,
		private readonly reflector: Reflector,
	) {}

	onApplicationBootstrap(): void {
		const undecided = this.undecidedHosts();

		if (undecided.length > 0) {
			throw new Error(
				[
					'These routes declare no access rule, so a request could reach them unchecked:',
					...undecided.map((route) => `  - ${route}`),
					'Mark each one @Public, @AuthenticatedOnly or @RequirePermissions.',
				].join('\n'),
			);
		}

		this.logger.log('Every route declares an access rule');
	}

	undecidedHosts(): string[] {
		const controllers = this.discovery.getControllers() as ControllerInstance[];

		return controllers.flatMap((wrapper) => {
			const prototype = Object.getPrototypeOf(wrapper.instance) as object | null;
			const name =
				(wrapper.metatype as { name?: string } | undefined)?.name ?? 'AnonymousController';

			return this.scanner
				.getAllMethodNames(prototype)
				.filter((method) => {
					const handler = (prototype as Record<string, object>)[method];
					if (typeof handler !== 'function') return false;
					if (Reflect.getMetadata(PATH_METADATA, handler) === undefined) return false;

					const targets: RouteTargets = [handler, wrapper.instance.constructor];
					return !declaresAccess({ reflector: this.reflector, targets });
				})
				.map((method) => `${name}.${method}`);
		});
	}
}
