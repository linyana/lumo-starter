# Agent instructions

## Design

Prefer simple, extensible designs. Optimize for fewer concepts, no special cases, and changes that
stay local.

**A branch the wire cannot produce is a comment pretending to be code.** Read the service before
drawing a partial outcome: a batch that asks about every row before it deletes answers all-or-nothing,
so a `deleted < ids.length` notice is a path nobody reaches and a reader will still believe.

## Comments

**A comment is written only where the code cannot say what it means.** The name, the type and the
shape of the branch already carry what happens; a comment that repeats them reads one level louder
and then drifts, and the reader soon believes the prose over the code. Write one where the reason is
not in this repository at all: a wire a spec dictates, an ordering that exists for a side effect
outside the function, a workaround pinned to a version someone else ships. `// handle the edge case`
and `// added for the delete flow` are the two shapes to cut — the first says nothing the next line
did not, the second narrates a change instead of the code that remains.

## Functions

**Two or more parameters become one object parameter.** A function takes a single positional value
at most; anything beyond that is a named object, so a call site reads as labels and a new field
never re-orders existing arguments.

```ts
// no
getUsers(page, pageSize, filter);
// yes
getUsers({ page, pageSize, filter });
```

The only exception is a signature the framework dictates (Nest guards, interceptors and pipes,
React event handlers, third-party callbacks): we cannot reshape those, so leave them alone.

## Layout

Domain first, then one folder per unit, at every level. **A folder holds two files, at most:
`index.ts` (its entry, or the barrel of what is below it) and `types.ts` (declarations).** Every
other name is a folder with its own `index.ts` — `constants/index.ts`, `schema/index.ts`,
`api/index.ts`, `mapper/index.ts`. kebab-case for folders and files.

Imports are alphabetical by specifier — `@/api` before `@/components`, `../delete` before `./types`
— and the block ends with one blank line before the first declaration. `oxfmt` leaves both alone, so
both are written by hand.

### `apps/web/src`

```
api/<resource>/index.ts             the wire: one folder per resource, `index` is the barrel
pages/<domain>/<screen>/index.tsx    screens, grouped by the rail's own groups
pages/<domain>/<screen>/types.ts     the screen's declarations, named by its siblings
providers/<concern>/{index, session/, guards/}
providers/layout/{frame,shell,auth}/  the block a screen sits in, the frames built on it,
                                     `index` is the barrel
hooks/<name>/{index, types}          request state, the app-wide store
lib/<module>/{index, client/, error/}
routes.tsx                           the route table, importing screens from `@/pages`
```

- Import the barrel (`@/api`, `@/pages`, `@/providers`, `@/hooks`, `@/lib`); siblings inside a domain
  reach for each other relatively. A resource module names the sibling it needs (`../roles`), never
  `@/api`: the barrel re-exports it, so that import would close a cycle.
- A layout receives what it draws: `providers/routes` derives the rail rows from `routes.tsx` and
  hands them to the shell, so no layout imports the table or the pages behind it. A frame a screen
  imports may never close a cycle through `@/pages`, which is exactly what that would be.
- The vendored `components/` keep importing the single module they need (`@/lib/utils`): the barrels
  would close a cycle there.
- A new screen is three edits: the folder, one line in its domain's `index.ts`, one row in
  `routes.tsx`. A new resource adds `api/<resource>/index.ts` and one line in `api/index.ts` — and
  no screen has to know where its calls live.
- **Declarations live in `types.ts`, behavior in `index.tsx`.** The state a screen holds open, the
  args a local dispatcher takes, the row and column shapes a caller is written against: all exported
  from `types.ts` whether one sibling names them or five. It is where a reader looks, and it keeps a
  doc comment on the declaration instead of on a function that happens to mention it. The one
  exception is the entry's own props type — `IPropsType`, unexported, in the file that declares the
  component — because a second name for it buys nothing. `components/` publishes `XxxProps` from its
  `types.ts` as always, since every screen may name those.
- **What a screen has open is one value, not a state per dialog.** The union lives in `types.ts`, the
  screen holds `useState<Panel | null>(null)`, and one function draws whichever kind is open:

  ```tsx
  const renderPanel = ({ panel, onOpenChange, reload }: PanelArgs): ReactElement => {
  	switch (panel.kind) {
  		case 'edit':
  			return <EditUser user={panel.user} open onOpenChange={onOpenChange} onUpdated={reload} />;
  		case 'delete':
  			return (
  				<DeleteUsers users={panel.users} open onOpenChange={onOpenChange} onDeleted={reload} />
  			);
  	}
  };
  ```

  Returning `ReactElement` rather than `ReactNode` is the whole guard: every case returns, so a kind
  with no case is a function that can end without returning and `TS2366` says so — no `default` that
  throws, no `satisfies never`, no mapped-type table. A table of renderers buys a line per kind and
  costs three type declarations plus a generic that exists only to be callable, so it does not pay at
  this size.

- **No ternaries in JSX, and no truthiness on a nullable.** A nullable reads `panel !== null && …`; a
  boolean reads `flag && …`. A chain of `a ? <A /> : b ? <B /> : <C />` is a union with a `switch`
  behind it, and the branch that "must be" the last one is the one nobody checks.
- **A folder is a verb, and one verb is one component.** `list`, `create`, `edit`, `delete`. A folder
  named after a quantity (`batch-delete`) or a second noun is a component that should have taken the
  rows as a payload: `DeleteUsers({ users })` deletes one row and a screenful with no branch, and the
  screen's `Panel` keeps a single `delete`.

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
