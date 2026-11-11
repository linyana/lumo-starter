/**
 * Every screen the router can reach, grouped by the domain it belongs to — `auth` for the
 * anonymous screens, `workspace` for the nav group of that name — and one folder per screen
 * inside. What only one screen needs sits beside it — a panel, a table, a form — while anything the
 * wire carries lives in `@/api`, because a second screen may ask for the same resource.
 *
 * `src/routes.tsx` imports from here, so a new screen adds its folder, one line in the domain's
 * `index.ts` and one row in the table.
 */
export * from './auth';
export * from './workspace';
