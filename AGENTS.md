# Agent instructions

Two tests decide whether a line belongs in this file: **a comment is worth writing only where the
code cannot say what it means**, and **a rule no tool executes is a comment pretending to be a
standard**. So every rule below names its judge — a compiler error, a lint rule, an `ls` — or it is
decidable by reading the one file in front of you. Anything else is a preference, and a preference
belongs in the pull request that argues for it, not here.

## Design

**A branch the wire cannot produce is a comment pretending to be code.** Read the service before
drawing a partial outcome: a batch that asks about every row before it deletes answers all-or-nothing,
so a `deleted < ids.length` notice is a path nobody reaches and a reader will still believe. Judge:
follow the call, name the input that reaches the branch. There is none, or the branch goes.

## Comments

**A comment is written only where the code cannot say what it means.** The name, the type and the
shape of the branch already carry what happens; a comment that repeats them reads one level louder
and then drifts, and the reader soon believes the prose over the code. Write one where the reason is
not in this repository at all: a wire a spec dictates, an ordering that exists for a side effect
outside the function, a workaround pinned to a version someone else ships. `// handle the edge case`
and `// added for the delete flow` are the two shapes to cut — the first says nothing the next line
did not, the second narrates a change instead of the code that remains.

## Functions

**Two or more parameters become one object parameter.** A function takes one positional value at most;
anything beyond that is a named object, so a call site reads as labels and a new field never re-orders
existing arguments.

```ts
// no
getUsers(page, pageSize, filter);
// yes
getUsers({ page, pageSize, filter });
```

The only exception is a signature the framework dictates (Nest guards, interceptors and pipes, React
event handlers, third-party callbacks): we cannot reshape those, so leave them alone. Judge: read the
signature. Nobody needs the history to count the commas.

## Layout

**A folder holds two files at most: `index.ts` (its entry, or the barrel of what is below it) and
`types.ts` (declarations). Every other name is a folder with its own `index.ts`.** Judge: `ls`. A
third file is the finding; a `PascalCase` or `camelCase` name is the other one.

### `apps/web/src`

```
api/<resource>/index.ts              the wire, one folder per resource
pages/<domain>/<screen>/index.tsx    a screen
hooks/<name>/{index,types}           request state, the app-wide store
lib/<module>/{index,client,error}    transport and the small shared modules
components/<group>/<name>/           the kit: index.tsx, types.ts, optional parts/
providers/<concern>/                 the session, the grant, the frames
routes.tsx                           the route table, importing screens from `@/pages`
```

- **A component is filed by what a screen needs it for, and there are six answers:** `form/` (a
  control whose value the screen collects), `overlay/` (something drawn over the page), `display/`
  (a thing that shows one fact), `feedback/` (the state of a wait or an outcome), `navigation/`
  (moving between places), `data/` (a collection of records). Provenance is not the axis: a wrapper
  of Base UI and one written here sit side by side when they answer the same need. Judge: name the
  need; the group follows.
- **A component is one folder, and it opens up twice.** `index.tsx` is the shape a screen wants;
  `parts/` is the same component taken apart, flat — `parts/root`, `parts/item`, never a nested tree.
  A folder that has a `parts/` is an assembly; one that does not is a leaf. Judge: `ls`.
- **A props type a caller may name is exported from the component's own folder.** Whether it sits in
  `types.ts` or in `index.tsx` is that folder's business; a screen redeclaring it is not.
- A screen imports `@/components`; only the kit reaches past it into a `parts/`. Inside the kit, a
  sibling part is relative (`../header`), another component is named by path
  (`@/components/<group>/<name>`), never by the barrel — one part naming the barrel would make one
  `div` depend on all 42. Judge: `grep -rn "parts/" apps/web/src/pages` finds nothing.
- **What a screen has open is one value, not a state per dialog.** The union of the open kinds lives
  in `types.ts`, the screen holds `useState<Panel | null>(null)`, and one function draws whichever
  kind is open. Judge: `tsc`. The renderer returns `ReactElement`, so a kind with no case is a
  function that can end without returning and `TS2366` says so — which is why there is no `default`
  that throws, no `satisfies never`, and no table of renderers.

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

- **A folder is a verb, and one verb is one component.** A screen's `list`, `create`, `edit` and
  `delete` each own one folder. `DeleteUsers({ users })` deletes one row and a screenful with no
  branch, so a folder named after a quantity — a second noun, not an action — is a component that
  should have taken the rows as a payload.
- **Declarations live in `types.ts` when a sibling or a screen has to name them:** the state a screen
  holds open, the args of a dispatcher, the row shape a caller is written against. Behavior stays in
  `index.tsx`.
- **A layout receives what it draws.** `providers/routes` derives the rail rows from `routes.tsx` and
  hands them to the shell, so no layout imports the table or the pages behind it, and a frame a
  screen imports can never close a cycle through `@/pages`. Judge: the diff touches the layout's
  props, not its imports.
- **A new screen is three edits:** the folder, one line in its domain's `index.ts`, one row in
  `routes.tsx`. A new resource is `api/<resource>/index.ts` plus one line in `api/index.ts`.

### `apps/api/src`

Nest's files keep Nest's naming; they are the framework's, and stay flat.

```
modules/<domain>/    <domain>.{controller,module,service}.ts, plus mapper/ refresh-cookie/
common/<kind>/       config/ db/ guards/ ..., plus codec/ table/ setup/
```

- `*.controller|module|service|filter|guard|interceptor|pipe|decorator|exception.ts` stay flat and
  named after their class; everything else is a folder with an `index.ts`.
- No barrels: the graph Nest reads is the file graph. Judge: `grep -rn "export \* from" src` finds
  nothing.
- **The API is ESM, so a relative specifier names the file (`.js` included), never a directory.**
  Judge: `tsc`, under `moduleResolution: node16`.

### `packages/shared/src`

```
index.ts     the only entry the exports map exposes
features/    business: one folder per feature — user/ now, product/ order/ later
common/      api/ auth/ error/ field/ pagination/ rbac/   everything cross-cutting
```

- Most work lands in `features/`; anything cross-cutting goes to `common/`, never inside a feature.
- **One verb, one schema.** A screen validates with the same object the API parses, so
  `createUserSchema` is both the form's rules and the request body. A second, looser shape of the
  same body — a `.partial()` nobody sends, a `Form` copy of a wire schema — is a shape with no second
  caller: add it when a caller exists, not before. Judge: `grep` the name; two schemas for one body
  are one too many.
- Kinds are folders where a domain has several of one — `common/<domain>/{constants,schema,rules}/`.
  A feature verb is one schema and one type — `features/<feature>/<verb>/{index,types}.ts`.
- Inside the package, import the domain itself (`../field`, `../../../common/pagination`), not a
  group barrel: the groups exist for the root barrel and for the reader.
- Consumers import `@lumo/shared`, never a path below it.
- **Runtime-agnostic: no `node:*`, no DOM.** Judge: `pnpm lint`. `no-restricted-imports` and
  `no-restricted-globals` in `.oxlintrc.json` fail the build on either, so this one is not a promise
  anybody has to remember.
