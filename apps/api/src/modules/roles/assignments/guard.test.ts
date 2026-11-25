import { describe, expect, it } from 'vitest';
import type { Permission } from '@lumo/shared';
import type { AuthActor } from '../../../common/types/index.js';
import { AppException } from '../../../common/errors/app.exception.js';
import type { ResolvedRole } from './index.js';
import { AssignmentGuard } from './guard.js';

const actorHolding = (permissions: Permission[]): AuthActor => ({
	id: 'user-1',
	email: 'manager@lumo.dev',
	username: 'morgan',
	createdAt: new Date('2026-01-01T00:00:00.000Z'),
	workspaceId: 'workspace-1',
	membershipId: 'membership-1',
	roles: [{ key: 'MANAGER', name: 'Manager' }],
	permissions,
});

const role = (key: string, permissions: Permission[]): ResolvedRole => ({
	id: `role-${key}`,
	key,
	name: key,
	permissions: permissions.map((permissionKey) => ({ permissionKey })),
});

type AssignClient = Parameters<AssignmentGuard['assertCanAssign']>[0]['client'];
type GrantClient = Parameters<AssignmentGuard['permissionsOf']>[0]['client'];

const clientWithOwners = (owners: number): AssignClient =>
	({
		membership: { count: () => Promise.resolve(owners) },
		$queryRaw: () => Promise.resolve([]),
	}) as unknown as AssignClient;

describe('AssignmentGuard.assertCanGrantPermissions', () => {
	const guard = new AssignmentGuard();

	it('lets an actor hand over what it already holds', () => {
		expect(() =>
			guard.assertCanGrantPermissions({
				actor: actorHolding(['member:read', 'member:write']),
				permissions: ['member:read'],
			}),
		).not.toThrow();
	});

	it('stops an actor from minting permissions it does not hold', () => {
		expect(() =>
			guard.assertCanGrantPermissions({
				actor: actorHolding(['member:read']),
				permissions: ['member:read', 'role:write'],
			}),
		).toThrow(/cannot grant permissions you do not hold: role:write/);
	});
});

describe('AssignmentGuard.assertCanManage', () => {
	const guard = new AssignmentGuard();

	it('lets an actor change a subject that carries no more than it does', () => {
		expect(() =>
			guard.assertCanManage({
				actor: actorHolding(['member:read', 'member:write']),
				permissions: ['member:read'],
				target: 'that member',
			}),
		).not.toThrow();
	});

	it('stops an actor from touching a subject that outranks it', () => {
		try {
			guard.assertCanManage({
				actor: actorHolding(['member:read', 'member:write']),
				permissions: ['member:read', 'member:write', 'audit:read'],
				target: 'that member',
			});
			throw new Error('expected a refusal');
		} catch (error) {
			expect(error).toBeInstanceOf(AppException);
			expect((error as AppException).code).toBe('FORBIDDEN');
			expect((error as AppException).message).toMatch(/cannot manage that member/);
			expect((error as AppException).message).toMatch(/audit:read/);
		}
	});
});

describe('AssignmentGuard.permissionsOf', () => {
	it('expands a membership through its roles', async () => {
		const client = {
			roleAssignment: {
				findMany: () =>
					Promise.resolve([
						{ role: { permissions: [{ permissionKey: 'member:read' }] } },
						{ role: { permissions: [{ permissionKey: 'audit:read' }] } },
					]),
			},
		} as unknown as GrantClient;

		const permissions = await new AssignmentGuard().permissionsOf({
			client,
			membershipId: 'membership-1',
		});

		expect([...permissions].sort()).toEqual(['audit:read', 'member:read']);
	});
});

describe('AssignmentGuard.assertCanAssign', () => {
	const guard = new AssignmentGuard();
	const manager = actorHolding(['member:read', 'member:write', 'role:write']);

	it('refuses a subject that carries a permission the actor lacks', async () => {
		await expect(
			guard.assertCanAssign({
				actor: manager,
				membership: {
					id: 'membership-2',
					roles: [{ key: 'OWNER', name: 'Owner' }],
					permissions: ['audit:read', 'member:read'],
				},
				next: [role('MEMBER', ['member:read'])],
				client: clientWithOwners(2),
			}),
		).rejects.toThrow(/cannot manage that member/);
	});

	it('refuses to strip the last owner', async () => {
		const owner = actorHolding(['member:read', 'member:write', 'role:write', 'audit:read']);

		await expect(
			guard.assertCanAssign({
				actor: owner,
				membership: {
					id: 'membership-2',
					roles: [{ key: 'OWNER', name: 'Owner' }],
					permissions: ['member:read', 'audit:read'],
				},
				next: [role('MEMBER', ['member:read'])],
				client: clientWithOwners(0),
			}),
		).rejects.toThrow(/only owner/);
	});

	it('refuses to hand over a permission the actor lacks', async () => {
		await expect(
			guard.assertCanAssign({
				actor: manager,
				membership: { id: 'membership-2', roles: [], permissions: [] },
				next: [role('ADMIN', ['member:read', 'audit:read'])],
				client: clientWithOwners(2),
			}),
		).rejects.toThrow(/cannot grant permissions you do not hold: audit:read/);
	});

	it('accepts an assignment the actor fully covers', async () => {
		await expect(
			guard.assertCanAssign({
				actor: manager,
				membership: { id: 'membership-2', roles: [], permissions: [] },
				next: [role('EDITOR', ['member:read'])],
				client: clientWithOwners(2),
			}),
		).resolves.toBeUndefined();
	});
});
