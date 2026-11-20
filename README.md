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
pnpm db:seed                  # three accounts, one per role

pnpm dev                      # web :5173 (proxying /api) + api :3000
```

Open <http://localhost:5173>. API docs live at <http://localhost:3000/docs> in development.

### Seeded accounts

| Email             | Password     | Role   | Can                                         |
| ----------------- | ------------ | ------ | ------------------------------------------- |
| `owner@lumo.dev`  | `Owner1234`  | OWNER  | everything (admin role management, deletes) |
| `admin@lumo.dev`  | `Admin1234`  | ADMIN  | `user:read`, `user:write` — no deletes      |
| `member@lumo.dev` | `Member1234` | MEMBER | `user:read` only                            |

Sign in as each one and watch the Users page change: a row's delete action and the route's `access`
block are answered by the same grant the API guard evaluates, expanded from one `ROLE_PERMISSIONS`
table.

---

## Scripts

Root scripts fan out through Turborepo.

| Command                               | What it does                                     |
| ------------------------------------- | ------------------------------------------------ |
| `pnpm dev`                            | shared (watch) + api (nest watch) + web (vite)   |
| `pnpm build`                          | shared → api → web, in dependency order          |
| `pnpm check`                          | format:check + lint + typecheck                  |
| `pnpm format` / `format:check`        | oxfmt                                            |
| `pnpm db:up` / `db:down` / `db:reset` | Docker Compose                                   |
| `pnpm db:migrate`                     | `prisma migrate dev`                             |
| `pnpm db:generate`                    | regenerate the Prisma client after a schema edit |
| `pnpm db:seed`                        | idempotent upsert of the three demo accounts     |
| `pnpm db:studio`                      | Prisma Studio                                    |

CI runs `pnpm check` and then `pnpm build`.

---

## How the "single source of truth" actually works

Everything below comes from **one edit** in `packages/shared`:

```
packages/shared/src/
  index.ts                  the one barrel; consumers never import below it
  features/                 the business: one folder per feature (product, order…)
    user/                   the wire shape, update input, list query
  common/                   everything cross-cutting
    auth/                   register & login schemas, the sign-in response
    field/                  email / password / name: rules + the sentence each shows
    rbac/                   who may do what
      permission/           PERMISSIONS = [...] as const, labels, zod enum
      role/                 ROLES + ROLE_PERMISSIONS (role → permissions)
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
| Permission check (server)      | `hasPermission({ roles, required })` in `PermissionsGuard`       |
| Permission check (client)      | `useAuth().can()` reads the same `permissionsOf()` expansion     |
| Nav/route visibility           | derived from the same `permissionsOf()` expansion                |

Native labels live beside the constants: `ROLE_META` (role → label) and `PERMISSION_META` (permission
→ label). Both use `satisfies Record<…>`, so adding a role or a permission fails compilation until the
UI label exists.

Database columns holding a role are plain `String[]`, decoded at the edge by
`apps/api/src/common/db/codec/index.ts`. A bad row throws on the way out instead of leaking as
`string`.

---

## API contract

```
POST   /api/auth/register     { email, name, password, confirmPassword } → { user }
POST   /api/auth/login        { email, password } → { accessToken, user } + Set-Cookie refresh
POST   /api/auth/refresh      (cookie) → { accessToken, user }  — rotates the token
POST   /api/auth/logout       (cookie) → 204, clears the cookie
GET    /api/auth/me           → { user }

GET    /api/users             ?page&pageSize&search&sort&order      (user:read)
GET    /api/users/:id                                                (user:read)
POST   /api/users             { email, name, password, roles? }      (user:write)
PATCH  /api/users/:id         { email, name, roles }                 (user:write)
DELETE /api/users/:id                                                (user:delete)
POST   /api/users/batch-delete   { ids }                             (user:delete)

GET    /api/health            terminus probe (not enveloped)
```

Success: `{ "data": … }`. Failure: `{ "error": { code, message, details? } }` where `code` is the
`ErrorCode` union and `details` carries `{ path, message }[]` of ready-to-show field sentences for
`VALIDATION_FAILED`.

---

## Authentication model

- **Access token** — short-lived JWT (15m, `ACCESS_TOKEN_TTL`), returned in the body, kept in
  memory by the client (`src/lib/http/client.ts`). Never `localStorage`, never a cookie.
- **Refresh token** — opaque random string in an `httpOnly` cookie scoped to `Path=/api/auth`,
  stored server-side only as a SHA-256 hash, rotated on every use.
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

## Common tasks

**Add a permission** — append to `PERMISSIONS`, then fix the compiler errors in `PERMISSION_META`
and `ROLE_PERMISSIONS`. Guards, nav and buttons follow.

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
become sortable titles; nothing else has to be wired.

**Change a table** — edit `prisma/schema.prisma`, `pnpm db:migrate`, `pnpm db:generate`.

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
- **Roles are `String[]`, not an enum** — adding a role never needs a migration (§4).

---

## Layout

```
.
├── apps
│   ├── api
│   │   ├── prisma/{schema.prisma, seed.ts}
│   │   ├── prisma.config.ts             # Prisma 7 connection config
│   │   ├── src/common/                  # pipes, filters, guards, swagger, db
│   │   └── src/modules/{auth,users,health}
│   └── web
│       ├── src/routes.tsx               # the route table: page, access, audience, nav
│       ├── src/api/{auth,users}         # every call the client makes, one folder per resource
│       ├── src/pages/{auth,workspace}   # screens, one folder each, grouped by domain
│       ├── src/providers/auth          # the session and the guards a route asks for
│       ├── src/providers/access        # the grant a gated row is filtered by
│       ├── src/providers/routes        # the table turned into route objects, plus the rail rows
│       ├── src/providers/layout/{frame,shell,auth} # the rail block, the shell on it, the auth column
│       ├── src/hooks/{use-http,use-query,use-global} # one request, a list's page and filters, the store
│       ├── src/lib/{http,form,toast,…}  # transport and the small shared modules
│       └── src/components/{form,overlay,display,feedback,navigation,data} # the kit
├── packages/shared                      # the single source of truth
└── docs/ARCHITECTURE.md                 # why each choice, and what it costs
```
