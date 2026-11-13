import type { Permission } from '../permission';
import type { Role } from '../role';

/**
 * What every access condition is evaluated against: the facts about the signed-in
 * user, not the rule about one thing. It holds roles *and* the permissions they
 * expand to, so a condition reads one list and never the role table — `grantFor`
 * below is the only constructor.
 */
export type AccessGrant = {
	readonly roles: readonly Role[];
	/** Already expanded from `roles` by `permissionsOf`. */
	readonly permissions: readonly Permission[];
};

/**
 * A rule about one thing on a screen — a column, a menu row, an action, a route,
 * a card. It lives beside the thing it gates and is stripped by `filterAccess`,
 * so the component that draws the thing never learns about roles.
 *
 * Every field is optional and stated fields AND together. A field holding a list
 * reads as: `permission` requires all of them, `role` requires any of them. An
 * empty condition (`{}`) grants, which is what makes a gated and an ungated item
 * the same shape.
 */
export type AccessCondition = {
	/** All of these permissions. Omitted or empty means any. */
	permission?: Permission | readonly Permission[];
	/** Any of these roles. Omitted or empty means any. */
	role?: Role | readonly Role[];
	/**
	 * A rule only the thing itself can state — "an account cannot delete itself",
	 * "this row is still a draft" — so it stays next to the data it was written
	 * for instead of moving into this package. Composed after the fields above, so
	 * a predicate narrows and never widens.
	 */
	when?: (grant: AccessGrant) => boolean;
};

/** Anything that can be gated by carrying an `access` block. */
export type WithAccess = { access?: AccessCondition };
