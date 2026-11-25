import 'reflect-metadata';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Permission } from '@lumo/shared';
import { describe, expect, it } from 'vitest';
import type { AuthActor } from '../types/index.js';
import { AUTHENTICATED_ONLY_KEY } from '../decorators/authenticated-only.decorator.js';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { AppException } from '../errors/app.exception.js';
import { PermissionsGuard } from './permissions.guard.js';

const actorWith = (permissions: Permission[]): AuthActor => ({
	id: 'user-1',
	email: 'owner@lumo.dev',
	username: 'olivia',
	createdAt: new Date('2026-01-01T00:00:00.000Z'),
	workspaceId: 'workspace-1',
	membershipId: 'membership-1',
	roles: [{ key: 'OWNER', name: 'Owner' }],
	permissions,
});

type Route = { handler: object; controller: object };

const handlerOf = (metadata: Record<string, unknown>): Route => {
	const handler = (): void => undefined;
	const controller = class Controller {};

	for (const [key, value] of Object.entries(metadata)) Reflect.defineMetadata(key, value, handler);

	return { handler, controller };
};

const contextOf = ({ handler, controller }: Route, actor?: AuthActor): ExecutionContext =>
	({
		getHandler: () => handler,
		getClass: () => controller,
		switchToHttp: () => ({ getRequest: () => ({ actor }) }),
	}) as unknown as ExecutionContext;

const codeOf = (run: () => unknown): string | undefined => {
	try {
		run();
		return undefined;
	} catch (error) {
		return error instanceof AppException ? error.code : 'NOT_APP_EXCEPTION';
	}
};

describe('PermissionsGuard', () => {
	const guard = new PermissionsGuard(new Reflector());

	it('lets a public route through without an actor', () => {
		const route = handlerOf({ [IS_PUBLIC_KEY]: true });
		expect(guard.canActivate(contextOf(route))).toBe(true);
	});

	it('lets an authenticated-only route through once the actor is resolved', () => {
		const route = handlerOf({ [AUTHENTICATED_ONLY_KEY]: true });
		expect(guard.canActivate(contextOf(route, actorWith([])))).toBe(true);
	});

	it('refuses a route that declared no access rule', () => {
		const route = handlerOf({});
		expect(codeOf(() => guard.canActivate(contextOf(route, actorWith([]))))).toBe('INTERNAL');
	});

	it('refuses a guarded route when no actor was resolved', () => {
		const route = handlerOf({ [PERMISSIONS_KEY]: ['member:read'] as Permission[] });
		expect(codeOf(() => guard.canActivate(contextOf(route)))).toBe('UNAUTHORIZED');
	});

	it('refuses when the actor is short of any required permission', () => {
		const route = handlerOf({
			[PERMISSIONS_KEY]: ['member:read', 'role:write'] as Permission[],
		});
		expect(codeOf(() => guard.canActivate(contextOf(route, actorWith(['member:read']))))).toBe(
			'FORBIDDEN',
		);
	});

	it('lets the actor through when it holds every required permission', () => {
		const route = handlerOf({
			[PERMISSIONS_KEY]: ['member:read', 'role:write'] as Permission[],
		});
		expect(
			guard.canActivate(contextOf(route, actorWith(['member:read', 'role:write', 'audit:read']))),
		).toBe(true);
	});
});
