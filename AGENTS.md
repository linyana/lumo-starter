# Agent instructions

## Design

Prefer simple, extensible designs. Optimize for fewer concepts, no special cases, and changes that
stay local.

## Layout

Domain first, then one folder per unit, at every level. **A folder holds two files, at most:
`index.ts` (its entry, or the barrel of what is below it) and `types.ts` (declarations).** Every
other name is a folder with its own `index.ts` — `constants/index.ts`, `schema/index.ts`,
`api/index.ts`, `mapper/index.ts`. kebab-case for folders and files.

### `apps/web/src`

```
pages/<domain>/<screen>/index.tsx    screens, grouped by the rail's own groups
providers/<concern>/{index, api/, session/, guards/}
providers/layout/{frame,shell,auth}/  the block a screen sits in, the frames built on it,
                                     `index` is the barrel
hooks/<name>/{index, types}          request state, the app-wide store
lib/<module>/{index, client/, error/}
routes.tsx                           the route table, importing screens from `@/pages`
```

- Import the barrel (`@/pages`, `@/providers`, `@/hooks`, `@/lib`); siblings inside a domain reach
  for each other relatively.
- A layout receives what it draws: `providers/routes` derives the rail rows from `routes.tsx` and
  hands them to the shell, so no layout imports the table or the pages behind it. A frame a screen
  imports may never close a cycle through `@/pages`, which is exactly what that would be.
- The vendored `components/` keep importing the single module they need (`@/lib/utils`): the barrels
  would close a cycle there.
- A new screen is three edits: the folder, one line in its domain's `index.ts`, one row in
  `routes.tsx`.
- **A props type nobody else names is not a declaration to share.** It lives in that component's own
  `index.tsx`, unexported, as `IPropsType` — no `types.ts` beside it. `types.ts` keeps what a second
  file has to name: a props type a sibling derives from (`Pick<SidebarProps, …>`), or the row and
  column shapes a caller is written against. So a screen and the panels under it say `IPropsType`,
  and `components/` publishes `XxxProps` from its `types.ts`, because every screen may name those.

### `apps/api/src`

Nest's files keep Nest's naming; they are the framework's, and stay flat.

```
modules/<domain>/    <domain>.{controller,module,service}.ts, plus mapper/ refresh-cookie/
common/<kind>/       config/ db/ guards/ …, plus codec/ table/ setup/
```

- `*.controller|module|service|filter|guard|interceptor|pipe|decorator|exception.ts` stay flat and
  named after their class; everything else is a folder with an `index.ts`.
- No barrels: the graph Nest reads is the file graph.
- The API is ESM, so a relative specifier names the file (`.js` included), never a directory.

### `packages/shared/src`

```
index.ts     the only entry the exports map exposes
features/    business: one folder per feature — user/ now, product/ order/ later
common/      api/ auth/ error/ field/ pagination/ rbac/   everything cross-cutting
```

- Most work lands in `features/`; anything cross-cutting goes to `common/`, never inside a feature.
- Inside the package, import the domain itself (`../field`, `../../../common/pagination`), not a
  group barrel: the groups exist for the root barrel and for the reader.
- `index.ts` and `types.ts` are the only files — kinds are folders: `constants/`, `schema/`,
  `rules/`.
- Runtime-agnostic: no `node:*`, no `fs`, no DOM.
- Consumers import `@lumo/shared`, never a path below it.
