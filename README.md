# lumo-starter

Full-stack starter: **React 19 + React Router 8 (data mode) + Vite 8 + Tailwind 4 + lumo-ui** on the
front, **NestJS 12 + Prisma 7 + PostgreSQL** on the back, wired together by a shared package that is
the single source of truth for types, validation and permissions.

```
apps/web        React SPA, static build, Vite proxies /api in dev
apps/api        NestJS API, JWT access token + rotating refresh cookie
packages/shared zod schemas, permission tables, error codes — imported by both
```

---

## Quick start

```bash
pnpm install
cp .env.example .env          # two keys, both already correct for local dev

pnpm db:up                    # Postgres 17 in Docker (waits for healthy)
pnpm db:generate              # Prisma client → apps/api/src/generated/prisma
pnpm db:migrate               # create + apply the initial migration
pnpm db:seed                  # one workspace, three members

pnpm dev                      # web :5173 (proxying /api) + api :3000
```

Open <http://localhost:5173>. API docs live at <http://localhost:3000/docs> in development.

### Seeded accounts

All three are members of the seeded `lumo` workspace, one role each.

| Email             | Password     | Role in `lumo` | Can                                   |
| ----------------- | ------------ | -------------- | ------------------------------------- |
| `owner@lumo.dev`  | `Owner1234`  | OWNER          | everything: members, roles, deletions |
| `member@lumo.dev` | `Member1234` | MEMBER         | `user:read` only                      |

Sign in as each one and watch the Users page change: a row's delete action and the route's `access`
block read the same grant the API guard evaluates, and that grant comes from the database — the roles
on `role_assignments`, expanded through `role_permissions`.

`OWNER` and `MEMBER` are the two roles the code ships. Everything between them is a workspace's own
business: create a role on the Roles screen, tick the permissions it should carry, and assign it —
that is the shape a real product needs anyway, because no starter can guess a customer's job titles.

A role is held per workspace, so the same person can be an OWNER in one and a MEMBER in another.
Registering a new account creates a workspace of its own and makes that account its OWNER.

---

## Scripts

Root scripts fan out through Turborepo.

| Command                               | What it does                                                       |
| ------------------------------------- | ------------------------------------------------------------------ |
| `pnpm dev`                            | shared (watch) + api (nest watch) + web (vite)                     |
| `pnpm build`                          | shared → api → web, in dependency order                            |
| `pnpm check`                          | format:check + lint + typecheck                                    |
| `pnpm format` / `format:check`        | oxfmt                                                              |
| `pnpm db:up` / `db:down` / `db:reset` | Docker Compose                                                     |
| `pnpm db:migrate`                     | `prisma migrate dev`                                               |
| `pnpm db:generate`                    | regenerate the Prisma client after a schema edit                   |
| `pnpm db:seed`                        | sync the permission catalog + system roles, then the demo accounts |
| `pnpm db:studio`                      | Prisma Studio                                                      |

CI runs `pnpm check` and then `pnpm build`.

---

## How the "single source of truth" actually works

Everything below comes from **one edit** in `packages/shared`:

```
packages/shared/src/
  index.ts                  the one barrel; consumers never import below it
  features/                 the business: one folder per feature (product, order…)
    role/                   a role's wire shape, create/update, and the rules a role must satisfy
    setting/                stored preferences: content schema, wire row, patch input
    user/                   the wire shape, update input, list query
    workspace/              the workspace a session is acting inside
  common/                   everything cross-cutting
    auth/                   register & login schemas, the sign-in response, the session
    field/                  email / password / name: rules + the sentence each shows
    rbac/                   who may do what
      permission/           PERMISSIONS = [...] as const, labels, the resource each belongs to
      role/                 SYSTEM_ROLES + SYSTEM_ROLE_PERMISSIONS (what the code ships seeded)
      access/               the grant, the conditions, and the one `hasPermission` check
    error/                  ERROR_CODES: the eight codes a client can switch on
    pagination/             page / pageSize / order
    api/                    the response envelope
```

| Derived artifact               | How                                                              |
| ------------------------------ | ---------------------------------------------------------------- |
| TypeScript types               | `z.infer<typeof registerSchema>` — never hand-written twice      |
| API request validation         | `@ZodBody(registerSchema)` on the controller                     |
| Form validation in the browser | the same schema, in `safeParse`, feeding Base UI's `Form errors` |
| Swagger request bodies         | `z.toJSONSchema()` via the `ApiZodBody` decorator                |
| Permission check (server)      | `hasPermission({ permissions, required })` in `PermissionsGuard` |
| Permission check (client)      | `useAuth().can()` over the `permissions` the session carried     |
| Nav/route visibility           | the same grant, through `allows()` / `filterAccess()`            |

Native labels live beside the constants: `SYSTEM_ROLE_META` (system role → label) and
`PERMISSION_META` (permission → label), and `PERMISSION_RESOURCE_META` names each group. All three use
`satisfies Record<…>`, so adding a permission fails compilation until it has a label and a group.

Nothing expands a role into actions on the client. The API resolves the grant and hands the session
its `permissions` array; the client only reads it. A key that is no longer in the catalog throws on
the way out of `apps/api/src/common/db/codec/index.ts` instead of leaking as `string`.

---

## API contract

```
POST   /api/auth/register     { email, username, name, password, confirmPassword } → session
POST   /api/auth/login        { email, password } → session + Set-Cookie refresh
POST   /api/auth/refresh      (cookie) → session — rotates the token, keeps the workspace
POST   /api/auth/logout       (cookie) → 204, clears the cookie
POST   /api/auth/switch-workspace { workspaceId } → session + Set-Cookie refresh
GET    /api/auth/me           → session
PATCH  /api/auth/me           { username?, email?, name? } → { user }   (the signed-in user)

session = { accessToken, user, permissions, workspace, workspaces }
          // permissions = what this actor may do in `workspace`; the token carries only sub + wid

GET    /api/users             ?page&pageSize&search&sort&order      (user:read)
GET    /api/users/:id                                                (user:read)
POST   /api/users             { email, username, name, password, roles? } (user:write)
PATCH  /api/users/:id         { email, username, name, roles }       (user:write)
DELETE /api/users/:id                                                (user:delete)
POST   /api/users/batch-delete   { ids }                             (user:delete)

GET    /api/roles                                                    (role:read)
POST   /api/roles             { name, permissions }                  (role:write)
PATCH  /api/roles/:id         { name, permissions }                  (role:write, this workspace's own)
DELETE /api/roles/:id                                                (role:write, its own again)

GET    /api/audit             ?limit&action&targetId                 (audit:read)
```

Every `/api/users` route reads and writes **memberships of the workspace in the access token**, never
the `users` table alone: the list is the people in this workspace, `roles` on a row are `{ key, name }`
pairs assigned here, and `DELETE` removes the membership rather than the global identity. A `roles`
array in a create/update body is a list of **keys**, resolved against the system roles and the
workspace's own; an unknown key is a `VALIDATION_FAILED`.

```
GET    /api/settings/me       → { setting: { type, content, updatedAt } }   (any signed-in user)
PATCH  /api/settings/me       { pageSize? } → { setting }                (any signed-in user)

GET    /api/health            terminus probe (not enveloped)
```

Success: `{ "data": … }`. Failure: `{ "error": { code, message, details? } }` where `code` is the
`ErrorCode` union and `details` carries `{ path, message }[]` of ready-to-show field sentences for
`VALIDATION_FAILED`.

---

## Authentication model

- **Access token** — short-lived JWT (15m, `ACCESS_TOKEN_TTL`), returned in the body, kept in
  memory by the client (`src/lib/http/client.ts`). Never `localStorage`, never a cookie. It carries
  `sub` and `wid` (the workspace it acts inside) and **no authorization at all**: `JwtAuthGuard`
  resolves the actor's roles and permissions from the database on every request, so a role edit or a
  removed membership takes effect on the next call rather than on the next token. Switching
  workspaces means a new token, not a new request shape.
- **Refresh token** — opaque random string in an `httpOnly` cookie scoped to `Path=/api/auth`,
  stored server-side only as a SHA-256 hash, rotated on every use. A session belongs to one workspace,
  so a refresh restores the workspace the user switched to, and a revoked membership ends it.
- **Reuse detection** — presenting an already-rotated token revokes every live session for that user
  and answers `UNAUTHORIZED` with a message saying so. The exception is a token rotated seconds ago:
  a reload aborts the response carrying its successor, so inside `REUSE_GRACE_MS` (30 s) it rotates
  again instead of killing the family. Logout and theft leave `replacedBy` empty, so they stay final.
- **CSRF** — the access token travels in `Authorization`, so a forged form post has nothing to ride
  on. The cookie is `SameSite=Lax` and same-origin in dev via the Vite proxy.
- **Client refresh** — `refreshSession()` is single-flight: ten parallel 401s produce one refresh.
  Its outcome keeps _expired_ (the server rejected the cookie) apart from _unavailable_ (the server
  did not answer), so a failed check at boot shows a retry screen instead of signing the user out.

Deploy the SPA and the API on the same origin behind a reverse proxy (`/api` → api). Cross-site
cookies would require `SameSite=None; Secure` and a CSRF token, which this starter deliberately
avoids.

---

## Authorization

Four tables, three orthogonal axes, and nothing else:

```
permissions        key, description          the actions the code can check (synced from code)
roles              key, name, workspaceId?    a named set; system = true belongs to the code
role_permissions   (roleId, permissionKey)    what a role carries
role_assignments   (membershipId, roleId)     who holds it here
```

A permission is `resource:action`. A role is a bundle. An assignment is scoped by the membership it
hangs from, so "where it applies" is never encoded in a role's name (`project_admin`, `order_editor`)
— that is how a homegrown RBAC rots into N×M roles.

Two rules decide whether a privilege change goes through, and they live in one place
(`modules/roles/assignments/guard.ts`) so every path that writes an assignment or a role's permissions
gets both:

| Rule                 | What it stops                                                         | Where it comes from             |
| -------------------- | --------------------------------------------------------------------- | ------------------------------- |
| **can-assign range** | granting a permission you do not hold, to anyone — including yourself | ARBAC's _can-assign_ constraint |
| **cardinality**      | demoting or deleting the last OWNER                                   | RBAC2's cardinality constraint  |

Range is checked on assignment _and_ on role create/update: a role that may manage roles but holds
little cannot mint one that holds more, and cannot widen its own. The cardinality check runs first, so
the last owner reads "The last owner cannot be demoted" rather than a generic refusal.

Changing your **own** roles is allowed, as long as both rules pass: leaving a workspace by dropping
your own role is a normal thing to want.

Every one of these writes appends an `audit_events` row in the same transaction — actor, action,
target, and `before`/`after` snapshots. Rows are never updated or deleted (the actor is stored by
value, so the log still reads after the account is gone), and `GET /api/audit` shows them.

### Keeping "at least one owner" true

The cardinality rule is a count, so it is a read-then-write: two owners demoting themselves at the
same moment would each see the other and both commit, leaving a workspace nobody can administer. Every
path that can remove an owner therefore takes the workspace row first (`lockWorkspace` →
`SELECT id FROM workspaces WHERE id = $1 FOR UPDATE`) and only then counts and writes, inside one
transaction. Two concurrent demotions now end with one `200` and one refusal.

A database trigger would enforce this for writes that bypass the API too, at the cost of logic Prisma
cannot see and cannot test in TypeScript. This starter keeps it in the service and ships the query
that finds such a workspace instead — run it after any hand-written SQL:

```sql
SELECT w.id, w.slug
FROM workspaces w
WHERE NOT EXISTS (
  SELECT 1
  FROM memberships m
  JOIN role_assignments ra ON ra."membershipId" = m.id
  JOIN roles r ON r.id = ra."roleId"
  WHERE m."workspaceId" = w.id AND r.system AND r.key = 'OWNER'
);
```

Repairing one is an `INSERT INTO role_assignments` of the OWNER role onto the membership that should
own it.

---

## Common tasks

**Add a permission** — append to `PERMISSIONS`, then fix the compiler errors in `PERMISSION_META` and
`PERMISSION_RESOURCE_META`, and give it to the system roles that should have it in
`SYSTEM_ROLE_PERMISSIONS`. Run `pnpm db:seed`: it syncs the catalog into `permissions` and rewrites
each system role's `role_permissions` from the code. Guards, nav and buttons follow.

**Add a role** — two shapes, picked deliberately:

- **A role the product ships** → add it to `SYSTEM_ROLES`, `SYSTEM_ROLE_META` and
  `SYSTEM_ROLE_PERMISSIONS`, then `pnpm db:seed`. It lands with `system = true` and the API will
  refuse to edit or delete it: code owns it. Removing a key from `SYSTEM_ROLES` deletes the role on
  the next seed, and every assignment that held it with it.
- **A role a workspace shapes itself** → nothing to code. `POST /api/roles` writes a row with
  `system = false` and that workspace's id, and its admins edit it from the Roles screen. Its key is
  slugged from the name once and never changes, so assignments survive a rename.

A role's permissions are a set: editing one replaces them for everyone holding it, on their next
request.

**Add a failure** — pick a code for the status, then state the sentence at the throw site. Nothing
else grows when a feature does:

```ts
throw new AppException({ code: 'CONFLICT', message: 'That email is already registered' });
throw new AppException('NOT_FOUND'); // default text for that code
throw new AppException(); // 500, default text
```

The only table is `apps/api/src/common/errors/table/index.ts`: one line per code with its status and
default sentence, and `Record<ErrorCode, …>` makes a new code a compile error until it has both.
Shared holds the `ErrorCode` union and nothing else about errors — wording lives where the rule
lives: field sentences inside the shared zod schemas (so a form and the API cannot disagree), and
business sentences at the throw site.

**Add an endpoint** — write or reuse a zod schema in `packages/shared/src` — one verb, one schema:
`features/<feature>/<verb>/index.ts` for a business body, `common/<domain>/schema/index.ts` for a
cross-cutting one — then add the handler with `@ZodBody` / `@ZodQuery` / `@ZodParams` and gate it
with `@RequirePermissions(...)`.

**Add a screen** — add `apps/web/src/pages/<domain>/<screen>/index.tsx`, one line in that domain's
`index.ts`, and a row in the table in `apps/web/src/routes.tsx` (`layout`, then `access` for a
gated page or `audience` for a bare one, and an optional `nav`); `providers/routes` wraps it in the
guards and `providers/layout` draws its nav row. Call the API through
`apps/web/src/api/<resource>/index.ts` — written with the typed `api` helper, so no screen names a
URL — and hold the result with `useHttp`, or `useQuery`, which is `useHttp` plus the page, the order,
the address bar and the filters, for a screen that shows a list. The filters are the `<Field name>`s
inside `<Form form={list.form} initial={list.opened} onChange={list.write} settle={300}>`, so no
screen names a `value` or a setter either. Give a table the same object and its `sortKey`-ed columns
become sortable titles; nothing else has to be wired. A settings page that saves as the user leaves
a field holds its fields with `useAutoSave({ form, schema, initial, endpoint })`: it validates the
field being left, sends that field alone when it differs from the last confirmed value, and returns
`blur`, `enter`, `busy` and `failed` for the control.

**Change a table** — edit `prisma/schema.prisma`, `pnpm db:migrate`, `pnpm db:generate`.

Migrations were squashed into one `init` while the starter had no deployments; `pnpm db:reset` drops
the volume and replays it.

**Watch a loading state** — set `API_DELAY_MS=1200` in `.env` and restart the API: every response,
including failures and `POST /auth/refresh`, arrives that many milliseconds later, so the app's own
startup loader keeps time with the screens behind it. A reload that aborts the refresh costs nothing:
the same cookie still returns a pair inside the reuse grace window. Back to `0` when the spinner is
believable.

---

## Gotchas

The reasoning behind each is in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — this list is only
the action to take.

- **Prisma 7** — the connection lives in `apps/api/prisma.config.ts`, not in the schema. Run
  `pnpm db:generate` after `install` and after every schema edit (ARCHITECTURE §3, Version notes).
- **The API is ESM** — every relative import ends in `.js`. A CommonJS build only _appears_ to work
  (ARCHITECTURE §9).
- **TypeScript is pinned to 5.9** — Nest's DI needs `emitDecoratorMetadata` (Version notes).
- **The UI kit belongs to this repository** — `apps/web/src/components` is maintained here, not
  installed from a registry: no `bunx shadcn add`, no upstream to diff against, no `components.json`.
  It is grouped by what a component is for — `form/ overlay/ display/ feedback/ navigation/ data/` —
  and each one is a folder that opens up twice: `index.tsx` is the shape a screen wants, `parts/` is
  the same component taken apart. All of it is linted, formatted and edited like the rest of `src`.
- **The AI skill** is landed locally, not committed: it goes to `.agents/skills/lumo-ui`
  (`bunx skills`), and `bunx skills update` refreshes it.
- **`.env` holds only `DATABASE_URL` and `JWT_ACCESS_SECRET`** — everything else is a constant in
  `apps/api/src/common/config/runtime/index.ts` (port, log level, token lifetimes, throttling). The
  exception is `API_DELAY_MS`, a test knob rather than config: it holds every response back so
  spinners and empty states are visible, `@SkipDelay()` opts a route out, and production ignores it.
- **Cookies are host-only**, `Secure` outside development. Subdomain deployments edit
  `refresh-cookie/index.ts` deliberately (§5).
- **Permissions are code, roles are rows** — `PERMISSIONS` is the only place an action is defined and
  `pnpm db:seed` copies it into the `permissions` table; roles exist in the database because a
  workspace may invent them at runtime. Never write a permission row by hand.
- **System roles cannot be edited through the API** — `system = true` rows belong to
  `SYSTEM_ROLE_PERMISSIONS`; `PATCH`/`DELETE` answer `FORBIDDEN`. A partial unique index plus a CHECK
  constraint in the init migration keep "system means no workspace" true even if a bug tries.
- **Roles live on `role_assignments`, not on `users`** — the same person can be OWNER in one workspace
  and MEMBER in another, so nothing may read a role from the user row.
- **A role that may edit members must also read roles** — `features/role/rule` refuses the pair
  otherwise, because the member editor loads the roles it assigns from `GET /roles`.
- **You cannot grant what you do not hold** — `AssignmentGuard` refuses a permission that is not in
  your own grant, on assignments and on role edits alike. Widening a role you hold yourself is the
  same check, so it fails the same way.
- **The audit log is append-only** — no update path, no delete path, and `before`/`after` hold the
  snapshot rather than a pointer to a row that may since have changed.
- **Settings are user-scoped on purpose** — `settings` keys on `(type, ownerId)`. A workspace-level
  setting would need `workspaceId` in that unique key, and a nullable column in a Postgres unique
  index does not collide, so the `type_ownerId` upsert would silently stop being unique.

---

## Layout

```
.
├── apps
│   ├── api
│   │   ├── prisma/{schema.prisma, seed.ts}
│   │   ├── prisma.config.ts             # Prisma 7 connection config
│   │   ├── src/common/                  # pipes, filters, guards, swagger, db
│   │   └── src/modules/{audit,auth,authorization,roles,users,workspaces,health}
│   └── web
│       ├── src/routes.tsx               # the route table: page, access, audience, nav
│       ├── src/api/{audit,auth,roles,users} # every call the client makes, one folder per resource
│       ├── src/pages/{auth,workspace}   # screens, one folder each, grouped by domain
│       ├── src/providers/auth          # the session (user + workspace) and the guards a route asks for
│       ├── src/providers/access        # the grant a gated row is filtered by
│       ├── src/providers/routes        # the table turned into route objects, plus the rail rows
│       ├── src/providers/layout/{frame,shell,auth} # the rail block, the shell on it, the auth column
│       ├── src/hooks/{use-http,use-query,use-roles,use-global} # one request, a list, the assignable roles, the store
│       ├── src/lib/{http,form,toast,…}  # transport and the small shared modules
│       └── src/components/{form,overlay,display,feedback,navigation,data} # the kit
├── packages/shared                      # the single source of truth
└── docs/ARCHITECTURE.md                 # why each choice, and what it costs
```
