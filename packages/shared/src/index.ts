/**
 * Public surface of the shared package. Keep this a barrel — consumers should
 * never reach into `src/**` paths directly, or the exports map stops meaning
 * anything.
 *
 * `features/` is where business lives: one folder per feature, the place most
 * work happens. `common/` holds everything cross-cutting `—` the response
 * envelope, the error codes, the pagination parameters, the rules a single field
 * owns, and `auth` (sign-in and sign-up). `common/rbac/` is who may do what (the permission table and the roles). Inside a
 * folder, kinds are folders too: `constants/`, `schema/`, `rules/`, and
 * `types.ts` when a domain declares types.
 *
 * Dependency rule: this package must stay runtime-agnostic (no `node:*`, no
 * `fs`, no DOM). It is imported by a browser bundle and by the API alike.
 */
export * from './common';
export * from './features';
