import 'reflect-metadata';
import { PATH_METADATA } from '@nestjs/common/constants';
import { type DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { describe, expect, it } from 'vitest';
import { AUTHENTICATED_ONLY_KEY } from '../decorators/authenticated-only.decorator.js';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { RouteAccessAudit } from './route-access.audit.js';

const onRoute = <T extends object>(controller: T, method: string): T => {
	Reflect.defineMetadata(PATH_METADATA, method, (controller as Record<string, object>)[method]!);
	return controller;
};

class Decided {
	list(): void {}
	me(): void {}
	health(): void {}
	helper(): void {}
}

onRoute(Decided.prototype, 'list');
Reflect.defineMetadata(PERMISSIONS_KEY, ['member:read'], Decided.prototype.list);
onRoute(Decided.prototype, 'me');
Reflect.defineMetadata(AUTHENTICATED_ONLY_KEY, true, Decided.prototype.me);
onRoute(Decided.prototype, 'health');
Reflect.defineMetadata(IS_PUBLIC_KEY, true, Decided.prototype.health);

class Undecided {
	list(): void {}
}

onRoute(Undecided.prototype, 'list');

const auditOver = (controllers: { instance: object; metatype: unknown }[]): RouteAccessAudit =>
	new RouteAccessAudit(
		{ getControllers: () => controllers } as unknown as DiscoveryService,
		new MetadataScanner(),
		new Reflector(),
	);

describe('RouteAccessAudit', () => {
	it('names every route handler that declared no access rule', () => {
		const audit = auditOver([
			{ instance: new Decided(), metatype: Decided },
			{ instance: new Undecided(), metatype: Undecided },
		]);

		expect(audit.undecidedHosts()).toEqual(['Undecided.list']);
	});

	it('stops the app from booting when a route is undecided', () => {
		const audit = auditOver([{ instance: new Undecided(), metatype: Undecided }]);

		expect(() => audit.onApplicationBootstrap()).toThrow(/Undecided\.list/);
	});

	it('boots when every route names its access rule', () => {
		const audit = auditOver([{ instance: new Decided(), metatype: Decided }]);

		expect(() => audit.onApplicationBootstrap()).not.toThrow();
	});
});
