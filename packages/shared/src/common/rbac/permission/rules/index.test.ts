import { describe, expect, it } from 'vitest';
import { PERMISSIONS } from '../constants';
import { groupedPermissions, resourceOf } from './index';

describe('groupedPermissions', () => {
	it('places every permission in exactly one group', () => {
		const grouped = groupedPermissions();
		const seen = grouped.flatMap((group) => group.permissions);

		expect(seen).toHaveLength(PERMISSIONS.length);
		expect([...seen].sort()).toEqual([...PERMISSIONS].sort());
	});

	it('names each group after the resource its permissions act on', () => {
		for (const group of groupedPermissions()) {
			for (const permission of group.permissions) {
				expect(resourceOf(permission)).toBe(group.resource);
			}
		}
	});
});

describe('resourceOf', () => {
	it('reads the resource from the key', () => {
		expect(resourceOf('member:read')).toBe('member');
		expect(resourceOf('audit:read')).toBe('audit');
	});
});
