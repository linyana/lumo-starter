/**
 * Who may do what: the permission table, the roles, and the rules over both.
 *
 * `access` is the layer everything else is gated through: a condition beside the
 * thing it gates (`{ permission: 'user:write' }`), evaluated against a grant by
 * `allows`, and stripped from a list by `filterAccess`. The API guard, the route
 * table, a table's columns and a menu's rows all say the same sentence in it.
 */
export * from './access';
export * from './permission';
export * from './role';
