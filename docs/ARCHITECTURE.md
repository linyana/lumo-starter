# Architecture decisions

A record of what was chosen, what it costs, and what was rejected. Read this before changing one of
these decisions — most of them are load-bearing for something else.

---

## 1. Monorepo with pnpm workspaces + Turborepo

**Chosen.** `apps/*` and `packages/*`, task graph in `turbo.json`, `^build` as the dependency edge.

**Why.** The shared package must be consumed by two runtimes. A monorepo makes that a path instead
of a published artifact, and Turborepo gives one `pnpm dev` plus caching for CI.

**And one version per dependency.** `typescript`, `zod` and `@types/node` are declared once
in a `catalog:` in `pnpm-workspace.yaml`; the package manifests say `catalog:`. Four copies of
`"typescript": "^5.9.3"` is four chances to drift — `@types/node` had already drifted by a minor
before this was introduced.

**Cost.** Turborepo is another config surface; `pnpm -r --parallel` would do without caching.

---

## 2. zod schemas in `packages/shared` are the single source of truth

**Chosen.** Validation rules, enums and permissions live in one place; everything else is derived.

**Why.** The requirement was "one implementation for the email check, the password length, and the
permission constants". Type generation from OpenAPI satisfies only half of that: it can
describe `format: email` and `minLength: 8`, but it cannot run. The browser form and the API guard
both need _executable_ validation, and they must agree. zod is the only layer that is
simultaneously a TypeScript type, a runtime validator, and (via `z.toJSONSchema`) an OpenAPI schema.

**Rejected.** `class-validator` DTOs + `openapi-typescript` on the client: the frontend would have to
re-implement every rule by hand, which is exactly the drift being designed out.

**Cost.** Nest's ecosystem is class-validator-first; anything that assumes DTO classes (some Swagger
plugins, custom validators) does not apply. The generated OpenAPI is slightly less rich than
hand-decorated DTOs.

---

## 3. `@lumo/shared` exposes source in development, `dist` in production

**Chosen.**

```json
"exports": { ".": {
  "development": "./src/index.ts",
  "types": "./dist/index.d.ts",
  "import": "./dist/index.js",
  "require": "./dist/index.cjs"
} }
```

**Why.** Vite resolves the `development` condition, so the web app compiles shared source directly —
edit a schema, the browser form changes with no rebuild. The API consumes `dist`,
rebuilt by `tsup --watch` under `turbo dev` (sub-100ms).

**Cost.** Two resolution paths to reason about. When debugging "why is the API seeing an old
schema", the answer is usually "shared wasn't rebuilt", not "the code is wrong".

---

## 4. Roles are `String[]`, not a Postgres enum or a join table

**Chosen.** `users.roles String[]`, valid values enforced by `roleSchema` at the boundary
(`apps/api/src/common/db/codec.ts`).

**Why.** Adding a role must not require a migration, and the role→permission table belongs in code
(`ROLE_PERMISSIONS`) so the frontend can evaluate the identical rule. A `Role`/`Permission` join
table would be correct for user-defined roles — this starter does not have them.

**Cost.** No database-level guarantee. `decodeRoles()` is mandatory at every read; a forgotten call
lets a `string` masquerade as a `Role`. That is why the mapper in `users/mapper/index.ts` is the only place
rows become wire objects.

**Upgrade path.** When roles become user-editable, move `ROLE_PERMISSIONS` into tables and keep the
shared function as the client-side cache of the same expansion.

---

## 5. Access token in memory, refresh token in an httpOnly cookie

**Chosen.** JWT access token returned in the response body; opaque refresh token in
`httpOnly; SameSite=Lax; Path=/api/auth`.

**Why.** localStorage is readable by any injected script. An httpOnly cookie is not, and scoping it
to `/api/auth` keeps it off every other request. The access token lives only in a module variable, so
a reload always goes through `/api/auth/refresh`.

**Rejected.** Refresh in localStorage: simplest, but one XSS becomes permanent account takeover.
Session cookies for everything: cannot serve a non-browser client with the same API.

**Cost.** The API and the SPA must share an origin (reverse proxy in production) or the cookie needs
`SameSite=None; Secure` plus CSRF tokens. The starter is built for the same-origin shape.

**Hardening already in place.** Refresh tokens are stored as SHA-256 hashes, rotated on every use,
and reuse of a rotated token revokes the whole family (an `UNAUTHORIZED` whose message says so).
Sign-in returns the same error for unknown account and wrong password.

---

## 6. React Router in data mode (SPA), not framework mode

**Chosen.** `createBrowserRouter` + `RouterProvider` from `react-router/dom`; the build is static
files.

**Why.** The API is a separate Nest process. SSR would add a second Node server whose only job is
rendering a shell, and would tempt data loading back into route loaders, splitting the source of
truth between the request hook and React Router.

**Cost.** No SSR — bad for SEO-sensitive pages, irrelevant for an authenticated app. A marketing site
in front of this would need its own rendering story.

---

## 7. `useHttp` owns request state; axios is only transport

**Chosen.** `src/lib/http/` unwraps `{ data }`, attaches the bearer token, refreshes single-flight on
401, and normalises every failure into `ApiError`. Components call endpoints through
`pages/*/*/api.ts` with `useHttp`, which holds `data / error / loading`. A list puts
`useList` on top of it: that one owns the page, the filters and the sort as well, so a screen
showing records holds no effect of its own and hands the whole result to the table as a single prop.
Each filter control is handed its own props by shape — `text`, `choice`, `flag` — so a screen names
neither the value nor the setter, and changing which control draws a filter never touches the query.

**Why.** Mixing fetch state into component state is what makes large React apps rot — but a cache
layer answers a question this app does not ask: every screen wants the server's answer _now_
(pagination, permissions, a row that was just deleted). The refresh queue only works correctly when
there is exactly one place that can trigger it, and that place is the http client either way.

**Cost.** A refetch is explicit: a changed query means an effect calling `fetchData`, where a cache
would have keyed it. No dedupe across components, no background revalidation.

---

## 8. Forms use Base UI's `<Form>` + zod directly, not react-hook-form

**Chosen.** `Field.Root name="email"` + `Field.Control render={<Input />}`, values collected by the
form, `safeParse` on submit, errors passed back through the `errors` prop.

**Why.** lumo-ui's form stack already collects values, focuses the first invalid field, and clears a
field's error as it is edited. Layering react-hook-form on top would mean two form state machines
competing for the same inputs. The zod schema is still the only validation rule, so the
"one source of truth" property survives.

**Rejected.** react-hook-form + `zodResolver`: better for very large forms with field arrays, but it
would bypass the component library's own form semantics.

**Cost.** Manual work for arrays/nested forms later; that is when react-hook-form is worth
reconsidering (and it can coexist on individual screens).

**Also rejected: antd's Form instance, for filters.** `Form.useForm()` + `onValuesChange` is how an
antd screen narrows a list, but the store would be a second owner of the query beside `useList`
(and a third beside the URL), and Base UI's `Form` has no `onValuesChange` at all — its non-native
controls report through `onValueChange`, so the model does not carry over. What is worth taking is
the half of `Form.Item` that removes `value`/`onChange` from the call site: a control bound by the
shape it reports a value in. That is `useList`'s `text` / `choice` / `flag`, and it needs no store.

---

## 9. Nest 12 + a hand-written `ZodValidationPipe`, in ESM

**Chosen.** ~30 lines in `common/pipes/zod-validation.pipe.ts` instead of `nestjs-zod`.

**Why.** `nestjs-zod` 5.5 declares `@nestjs/common ^10 || ^11`; the ecosystem is on 12. A pipe is
small enough to own, has no version coupling, and `zodToSchema()` already covers Swagger.

**Cost.** No `createZodDto` sugar, no automatic `@ZodSerializerDto`. If `nestjs-zod` ships Nest 12
support, migrating is mechanical.

**And: the API is an ES module.** `@nestjs/common` 12 ships `"type": "module"` with no `require`
condition, so a CommonJS build only runs by accident (Node 24's `require(esm)`) and does not typecheck
under `moduleResolution: node16`. Consequences:

- `apps/api/package.json` has `"type": "module"`; tsconfig uses `module`/`moduleResolution: node16`.
- Every relative import in the API ends in `.js` — that is what `node16` requires of ESM files.
- Prisma generates with `moduleFormat = "esm"`.

**Cost of that.** The `.js` suffixes look wrong next to the `.ts` files but are the standard ESM-TS
shape; Vite resolves them back to source.

---

## 10. Global response envelope, opt-out for probes

**Chosen.** `ResponseInterceptor` wraps successes in `{ data }`; failures are
`{ error: { code, message, details? } }`. `@SkipEnvelope()` for `/health` and 204s.

**Why.** One shape to unwrap on the client, one place that maps codes to HTTP status and default
wording (`apps/api/src/common/errors/errors.ts`).

**Codes are transport-level, wording belongs to the thrower.** There are eight codes, not one per
failure: `EMAIL_TAKEN` would have been a code that existed only to carry a sentence. Each code owns
a status and one default sentence; `AppException` takes everything optionally —
`{ code, message, status, details }` — and fills the gaps from that table, so
`throw new AppException()` is a 500 with the generic wording.

A sentence is written where its rule is: in the zod schema for a field rule (shared, so the form and
the API quote the same words without a lookup), at the throw site for a business rule. Shared keeps
only the `ErrorCode` union — it has no reason to know what the API will say, and a client shows the
message it was given.

**Cost.** Wording is single-language: the API resolves it before sending. A localized product would
add a key alongside each sentence, which is a deliberate second reader — not something to build
speculatively.

**Cost.** Third-party clients must read the envelope. The health endpoint deliberately does not
follow it — terminus has its own schema that uptime tooling expects.

---

## 11. The platform's own facilities, not middleware packages

**Chosen.** `NodeAdapter` (`@nestjs/platform-node`) instead of `platform-express`; security headers
from `app.useSecurityHeaders()`, cookies from `@Cookies()` and `res.cookie()` in `refresh-cookie/`.
`helmet` and `cookie-parser` are gone.

**Why.** Nest 12 ships both: `useSecurityHeaders()` sends the same headers and defaults as helmet 8,
including on 404s and errors, and the `@Cookies()` decorator parses the `Cookie` header per request,
so reading a cookie needs no package adapted to Express. What remains between Nest and the socket is
one adapter and no framework under it.

**Cost.** The two are no longer registered on the module. `useSecurityHeaders()` installs a request
hook on the adapter rather than middleware, so it has to be called in `bootstrap()` right after
`create()`; a hand-built module gets no security headers unless it calls it too.

**Rule.** Reach for the platform's own facility before adding a middleware package. A facility that
exists only on the application object lives in `bootstrap()`; middleware that is genuinely needed
still goes on the module (`AppModule.configure`), so every way of building the app shares one
pipeline.

**Also: one request type.** The JWT guard attaches `user` to the request, so `common/types` declares
`AuthenticatedRequest = NodeRequest & { user?: AuthUser }` instead of augmenting a global namespace.
A guard, a filter and a handler each name the request they were given.

---

## 12. `.env` holds secrets, the code holds knobs

**Chosen.** Two keys: `DATABASE_URL` and `JWT_ACCESS_SECRET`. Port, log level, access-token lifetime,
refresh lifetime, throttling and cookie security are constants in
`apps/api/src/common/config/runtime.ts`. `NODE_ENV` is read from the process, not from `envSchema`.

**One exception.** `API_DELAY_MS` is the third schema key, and it is a test knob instead of a
setting: it holds every response back so a frontend can watch its spinners and empty states, and it
differs per machine and per afternoon. Defaulting to 0 keeps it out of `.env.example`'s way, and
`DelayInterceptor` reads it as 0 under `NODE_ENV=production`, so a forgotten value cannot slow a
deployment.

**Why.** The previous `.env.example` had seventeen keys, of which fifteen never changed — and four of
those did not exist in the schema at all. Config surface nobody turns costs attention on every read
and invites "did I set that?" doubt. A constant in a typed file is greppable, reviewed in the same
diff as the code that reads it, and cannot drift from its validator.

**Cost.** Changing the port or the rate limit is a code change, not a deploy-time edit. Promoting a
value back into `env.schema.ts` is one line — and that edit is exactly the signal that a second
environment now exists.

**Also dropped.** `enableCors` and its origin: development goes through the Vite proxy and production
is same-origin behind a reverse proxy, so the CORS config only described a shape the starter does not
ship. A cross-origin client has to add it back, knowingly.

---

## 13. SWC builders for the API, `tsc --noEmit` as the type gate

**Chosen.** `nest-cli.json` sets `compilerOptions.builder: "swc"`, so `pnpm build` and `pnpm dev` in
`apps/api` transpile with SWC. The type checker is not part of the build at all; `tsc --noEmit` runs
as its own Turbo task (`pnpm typecheck`) and CI runs `pnpm check` before `pnpm build`.

**Why.** SWC is what the Nest docs recommend for build speed, and compilation was the slowest step of
the loop. Measured on this repo (43 files, 5.8k LOC, Windows), `tsc` 5.9.3 vs `@swc/core` 1.16:

| Step                                          | tsc   | swc       |
| --------------------------------------------- | ----- | --------- |
| compiler phase only                           | ~3.7s | ~0.4s     |
| `pnpm build` (wall clock, includes Nest CLI)  | ~4.6s | ~2.8-4.0s |
| `pnpm dev`, touch a file to app running again | ~4.6s | ~3.8s     |

The compiler gets ~10x faster, but wall clock does not, because Nest CLI startup plus `node` boot plus
Prisma connect dominate the dev cycle. The honest claim is 1-2s off a build and half a second off an
edit-refresh — small today, growing with the codebase: tsc's cost scales with the program, SWC's does
not. That is the reason to set it here rather than later, when it is a migration.

**Cost.** Two dev dependencies, and a build that happily ships a type error if you skip
`pnpm typecheck` — which is precisely why the type gate lives in `check` and CI runs it first. Watch
for the one trap: SWC does not run the `@nestjs/swagger` CLI plugin, so a `plugins` entry in
`nest-cli.json` would silently stop generating metadata unless you also enable
`compilerOptions.typeCheck` (which runs `tsc --noEmit` alongside SWC). This app builds its document
from zod via `zodToSchema`, so no plugin is involved.

Verified after the switch: ESM output (`"type": "module"` in `apps/api/package.json`) keeps working,
DI and `design:paramtypes` metadata survive, and `node dist/main.js` boots with `/api/health` and
`/docs/json` responding.

---

## 14. oxlint and oxfmt, not ESLint and Prettier

**Chosen.** `oxlint` lints, `oxfmt` formats. ESLint, `typescript-eslint`, `@eslint/js`, `globals`,
`eslint-config-prettier` and Prettier are gone: six dev dependencies out, two in.

**Why.** Both are Rust binaries. The whole repo formats in ~20ms and the three packages lint in
~0.6s, against seconds for ESLint and Prettier per package — the cost of `check` stopped being a
reason to run it less often. The rule names carried over one for one (`no-unused-vars` with
`^_` ignores, `no-explicit-any` as a warning, `consistent-type-imports` with `inline-type-imports`),
so the code did not need to change: `oxfmt --migrate=prettier` reproduced it and flagged a single
file, a union type it prefers one member per line.

**Why the config is JSON.** `.oxlintrc.json` has no program to run, so per-app environments are
`overrides` on `files` globs rather than objects in a `tseslint.config()` call: `apps/web` gets
browser globals, the API and the packages Node ones, and `consistent-type-imports` stays off inside
the API, where `emitDecoratorMetadata` needs the value import.

**Cost.** The “not our code” list now exists twice — `ignorePatterns` in `.oxlintrc.json` and in
`.oxfmtrc.json` — because neither tool reads the other's config. Adding a registry file means two
edits, and the two lists are the only thing here that can drift. `oxfmt` reads `.gitignore` on its
own, so only tracked-but-not-ours paths are listed.

**Also switched off.** `sortPackageJson` (on by default in `oxfmt`) and `sortImports` (off by
default): reordering a file is not a formatting decision this repo makes.

---

## Version notes

| Thing          | Version     | Why this one                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript     | 5.9         | TS 7.0 ships the `tsc` executable but no JS compiler API (7.1 is expected to restore one), and two tools here import that API: `tsup` with `dts` (`rollup-plugin-dts` crashes on `undefined.sys`) and `@nestjs/cli` (asserts `getParsedCommandLineOfConfigFile` in `typescript-loader.js`). Not the blocker: `emitDecoratorMetadata` — 7.0.2 emits `design:paramtypes` correctly — and `tsc --noEmit` is green on both apps under it. The tsconfigs already avoid what TS 6/7 removed (`moduleResolution: node10`, `baseUrl`) and set `rootDir` explicitly, so the bump is tooling-only once those two catch up. |
| Prisma         | 7.10.1      | `latest` on npm is `8.0.0-rc`; `@prisma/client` stable is 7.x. Do not mix them.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Nest           | 12.3        | ESM-only, which is why the API is `"type": "module"` and relative imports carry `.js`. Also forces the hand-written zod pipe (see 9).                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| React Router   | 8.5         | ESM-only, `react-router-dom` removed — import from `react-router` / `react-router/dom`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Tailwind       | 4.3         | CSS-first config; there is no `tailwind.config.js`. Theme variables are merged into `src/styles/index.css` by the registry installer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| pnpm           | 11          | Uses `allowBuilds` in `pnpm-workspace.yaml`; `onlyBuiltDependencies` no longer gates postinstall.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| oxlint / oxfmt | 1.91 / 0.76 | The Rust lint + format pair (§14). `oxfmt` is pre-1.0, so a config key can move between minors: bump the two together and read the changelog.                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

---

### Editor tooling

`.vscode/settings.json` points `js/ts.tsdk.path` at the workspace compiler. Without it an editor falls
back to the installed VS Code build or a newer global TypeScript (7.x is `latest` on npm), so the
squiggles in the editor come from a different compiler than `pnpm typecheck` — same file, two
answers, and the one you trust is the one that is not in CI. Other editors: point them at
`node_modules/typescript/lib` the same way.

## Known gaps / deliberate omissions

- No test suite. Nothing in the repo is wired for one: there is no `test` script in any manifest, no
  runner in the catalog, and no `vitest.config` in the API. Adding one back is a manifest edit, a
  runner dependency and a config file.

- No Redis, queue, file upload, websocket, i18n, or observability exporter. Add the service to
  `docker-compose.yml` when you need one; nothing here is wired for it.
- No refresh-token device list or "sign out everywhere" UI. The service method exists
  (`updateMany` by `userId`); the endpoint does not.
- No rate limiting per route — the global throttler is 120 requests/minute per IP.
- No `pnpm deploy`-based production image; the deployment shape assumed here is "build static files
  and run `node dist/main.js` behind a reverse proxy".
- Swagger is disabled when `NODE_ENV=production`; the document lists every route and payload.
