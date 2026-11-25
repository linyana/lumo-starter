import { describe, expect, it } from 'vitest';
import type { WithAccess } from '../types';
import { allows, filterAccess, grantOf, hasPermission } from './index';

const grant = grantOf({
	roles: [{ key: 'OWNER', name: 'Owner' }],
	permissions: ['member:read', 'audit:read'],
});

describe('hasPermission', () => {
	it('asks for every permission it is given', () => {
		expect(hasPermission({ permissions: grant.permissions, required: 'member:read' })).toBe(true);
		expect(
			hasPermission({ permissions: grant.permissions, required: ['member:read', 'audit:read'] }),
		).toBe(true);
		expect(
			hasPermission({ permissions: grant.permissions, required: ['member:read', 'role:write'] }),
		).toBe(false);
	});

	it('refuses everything to an empty grant', () => {
		expect(hasPermission({ permissions: grantOf().permissions, required: 'member:read' })).toBe(
			false,
		);
	});
});

describe('allows', () => {
	it('lets an unconditional item through', () => {
		expect(allows({ grant })).toBe(true);
	});

	it('matches a permission', () => {
		expect(allows({ condition: { permission: 'member:read' }, grant })).toBe(true);
		expect(allows({ condition: { permission: 'member:write' }, grant })).toBe(false);
		expect(allows({ condition: { permission: ['member:read', 'audit:read'] }, grant })).toBe(true);
	});

	it('accepts any of the named roles', () => {
		expect(allows({ condition: { role: ['MEMBER', 'OWNER'] }, grant })).toBe(true);
		expect(allows({ condition: { role: 'MEMBER' }, grant })).toBe(false);
	});

	it('runs the predicate last', () => {
		expect(allows({ condition: { when: () => false }, grant })).toBe(false);
		expect(allows({ condition: { permission: 'role:write', when: () => true }, grant })).toBe(
			false,
		);
	});
});

describe('filterAccess', () => {
	it('keeps the items the grant allows', () => {
		const items: readonly (WithAccess & { id: string })[] = [
			{ id: 'plain' },
			{ id: 'readable', access: { permission: 'member:read' } },
			{ id: 'ownerOnly', access: { role: 'MEMBER' } },
		];

		expect(filterAccess({ items, grant }).map((item) => item.id)).toEqual(['plain', 'readable']);
	});
});
