import { describe, expect, it } from 'vitest';
import { decodePermissions } from './index.js';

describe('decodePermissions', () => {
	it('collapses repeats', () => {
		expect(decodePermissions(['member:read', 'member:read'])).toEqual(['member:read']);
	});

	it('drops a key that left the catalog instead of throwing on the request path', () => {
		expect(decodePermissions(['member:read', 'member:archive'])).toEqual(['member:read']);
	});

	it('reads an empty list as an empty grant', () => {
		expect(decodePermissions([])).toEqual([]);
	});
});
