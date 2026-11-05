# code-tree

> A flat list of paths drawn as the tree a person reads a project in: folders that open and close, one file active. The rows are Nav — hover, active fill, caret and focus come from there — so the tree only supplies the shape and the glyph each file is drawn with.

## install

```bash
bunx shadcn@latest add @lumo/code-tree
```

- payload: `/r/code-tree.json`
- docs page: `/code-tree`
- comes with it: `@lumo/nav`, `@lumo/utils`, `@lumo/collapsible`
- npm packages: `@base-ui/react`, `lucide-react`
- lands in: 3 files under the project's `aliases.components`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/blocks/code-tree/index.tsx

```tsx
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import { Folder, FolderOpen } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { Collapsible } from '@/components/ui/collapsible';
import { Nav } from '@/components/ui/nav';
import { cn } from '@/lib/utils';
import { fileGlyph } from './glyph';
import { foldersOf, normalPath, treeOf, type CodeTreeNode } from './tree';

/**
 * What a row is drawn with at each size, and the one measure the tree adds to a nav row: one level
 * of nesting, in px.
 *
 * The type is the page's at both sizes: a path is text a reader reads, not code they compare, so the
 * two sizes are a row height rather than a type scale. `Nav.SubList` indents 28px per level, which
 * is right for a sidebar with one level of sub rows and wrong for a path five folders deep in a
 * 240px column. So a folder here is the same recipe `Sub` uses — a Base UI collapsible around a
 * `Nav.Button` with the nav's own caret — and the children are a list whose rows carry their own
 * indent.
 */
const rowsOf = {
	sm: 'h-7 text-sm',
	md: 'h-8 text-sm',
} as const;
const STEP = 8;
const INSET = 8;
/** What the trailing action of a row takes: `Nav.Action` is 20 wide, four from the end. */
const ACTION = 24;
/** What a row that is context rather than the thing is drawn with. */
const QUIET = 'text-muted-foreground';

/**
 * The box a row is scrolled in: the nearest ancestor whose overflow is its own. One that does not
 * happen to overflow right now is still the answer — it is the box that will move when it has to.
 */
function scrollerAround(row: HTMLElement) {
	for (let box = row.parentElement; box !== null; box = box.parentElement) {
		const { overflowY } = getComputedStyle(box);
		if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') return box;
	}
	return null;
}

export type CodeTreeProps = Omit<ComponentProps<'div'>, 'children' | 'onSelect'> & {
	/** The files to draw, as full paths (`src/lib/utils.ts`). The folders between them are the tree. */
	paths: string[];
	/** The file on screen. Kept by the caller, because what is being shown is theirs. */
	selected?: string;
	onSelect?: (path: string) => void;
	/** Folders shut on the first frame, by path. Everything else opens. */
	defaultCollapsed?: string[];
	/**
	 * The files the tree is about: the files themselves and the folders leading to them at full
	 * strength, every other row drawn quiet — so a tree of a component and the files it installs
	 * reads as the component first and its dependencies after. Folding is `defaultCollapsed`'s
	 * business; this one only decides the colour.
	 */
	primary?: string[];
	/**
	 * A secondary action riding on every file row, from the path to the element that does it — a
	 * copy, in the dialog that shows the files. It is drawn on the row's trailing edge and comes out
	 * on hover, so the tree stays a tree; a folder has none, because there is nothing to act on.
	 */
	action?: (path: string) => ReactNode;
	size?: keyof typeof rowsOf;
};

/**
 * A list of paths, drawn as the navigation it is.
 *
 * No row is drawn here: a file is `Nav.SubButton` and a folder is `Nav.Button`, so the cursor, the
 * hover layer, the active fill, the caret, the type scale and the focus ring are the nav's — the
 * same ones a sidebar uses. What is left is the shape: paths in, folders out, one level of indent,
 * and the glyph each file is drawn with.
 */
export function CodeTree({
	paths,
	selected,
	onSelect,
	defaultCollapsed,
	primary,
	action,
	size = 'sm',
	className,
	...props
}: CodeTreeProps) {
	// A caller's array is a new one on every render; the paths themselves are what the tree is
	// built from, so the work is keyed by the list rather than by the array.
	const key = paths.join('\n');
	const nodes = useMemo(() => (key === '' ? [] : treeOf(key.split('\n'))), [key]);
	// The same is true of `primary`: the list is new on every render, the files are not.
	const primaryKey = primary?.join('\n');
	const about = useMemo(
		() =>
			primaryKey === undefined || primaryKey === ''
				? null
				: new Set(primaryKey.split('\n').map(normalPath)),
		[primaryKey],
	);
	// The folders those files sit in: the ones that open, and the ones that stay at full strength.
	const leading = useMemo(() => (about === null ? null : foldersOf(about)), [about]);
	// Read once and never written: the folds belong to Base UI from here on, so a folder the reader
	// opens stays open while `defaultCollapsed` says otherwise.
	const [shut] = useState(() => new Set((defaultCollapsed ?? []).map(normalPath)));
	const current = selected === undefined ? undefined : normalPath(selected);
	const tree = useRef<HTMLDivElement>(null);

	// A selection that arrives from outside — the dialog's own file, an arrow key, a link — is
	// brought into view: a selection nobody can see is not a selection. The first one is not: it is
	// the caller's own, and the frame it lands in is the caller's to arrange, so a tree mounted below
	// the fold of a long page does not pull that page down to itself as it appears. Only the box the
	// tree is scrolled in moves — `scrollIntoView` would take every ancestor with it.
	const shown = useRef(current);
	useEffect(() => {
		if (current === undefined || shown.current === current) return;
		shown.current = current;

		const row = tree.current?.querySelector<HTMLElement>(
			'[data-slot="nav-sub-button"][data-active]',
		);
		if (row === null || row === undefined) return;
		const box = scrollerAround(row);
		if (box === null) return;

		// `nearest`, as `scrollIntoView` would have it: only move when the row is outside the box, and
		// then only as far as it takes to bring it back in.
		const rowRect = row.getBoundingClientRect();
		const top = rowRect.top - box.getBoundingClientRect().top;
		const bottom = top + rowRect.height;
		if (top < 0) box.scrollTop += top;
		else if (bottom > box.clientHeight) box.scrollTop += bottom - box.clientHeight;
	}, [current]);

	return (
		<div
			ref={tree}
			data-slot="code-tree"
			data-size={size}
			className={cn('w-full min-w-0', className)}
			{...props}
		>
			<Nav.List className="gap-px">
				{nodes.map((node) => (
					<Node
						key={node.path}
						node={node}
						depth={0}
						size={size}
						leading={leading}
						about={about}
						shut={shut}
						current={current}
						action={action}
						onSelect={onSelect}
					/>
				))}
			</Nav.List>
		</div>
	);
}

type NodeProps = {
	node: CodeTreeNode;
	depth: number;
	size: keyof typeof rowsOf;
	shut: ReadonlySet<string>;
	/** The folders that lead to a primary file; null when the tree was given no `primary`. */
	leading: ReadonlySet<string> | null;
	/** The files the tree is about; null when it was given no `primary`. */
	about: ReadonlySet<string> | null;
	current?: string;
	action?: (path: string) => ReactNode;
	onSelect?: (path: string) => void;
};

function Node({ node, depth, size, shut, leading, about, current, action, onSelect }: NodeProps) {
	// Inline because it is a number the tree computed, not a step in a scale: the row is a grid of
	// one column per level, and no class name can say which level this is.
	const indent = { paddingInlineStart: INSET + depth * STEP };

	if (node.kind === 'file') {
		const active = node.path === current;
		// Quiet is for the context around the component, and the file being read is never context.
		const quiet = about !== null && !about.has(node.path) && !active;

		return (
			<Nav.SubItem>
				<Nav.SubButton
					icon={fileGlyph(node.name)}
					isActive={active}
					aria-current={active ? 'true' : undefined}
					data-quiet={quiet || undefined}
					className={cn(
						rowsOf[size],
						// What `Nav.Action` measures itself against, and the room it takes on the row.
						action !== undefined && 'peer/nav-button',
						quiet && QUIET,
					)}
					style={
						action === undefined
							? indent
							: { ...indent, paddingInlineEnd: INSET + ACTION }
					}
					onClick={onSelect === undefined ? undefined : () => onSelect(node.path)}
				>
					{node.name}
				</Nav.SubButton>
				{action?.(node.path)}
			</Nav.SubItem>
		);
	}

	// A folder off the way to a primary file is the tree's context: quiet, but open like any other —
	// a tree that folded its context as well would hide the files the reader came to read.
	const quiet = leading !== null && !leading.has(node.path);

	return (
		<Nav.SubItem>
			<BaseCollapsible.Root defaultOpen={!shut.has(node.path)}>
				{/* The same two parts `Nav.Sub` composes, in a different order: the caret leads the row
				    instead of trailing it, because in a tree the caret is what marks the level — a row
				    that ends in one reads as a sidebar's, not as a file's. */}
				<BaseCollapsible.Trigger
					render={
						<Nav.Button
							icon={
								<>
									<Collapsible.Icon />
									<FolderGlyph />
								</>
							}
							label={node.name}
							data-quiet={quiet || undefined}
							className={cn('group', rowsOf[size], quiet && QUIET)}
							style={indent}
						/>
					}
				/>
				<Collapsible.Panel>
					<Nav.List className="gap-px">
						{node.children.map((child) => (
							<Node
								key={child.path}
								node={child}
								depth={depth + 1}
								size={size}
								shut={shut}
								leading={leading}
								about={about}
								current={current}
								action={action}
								onSelect={onSelect}
							/>
						))}
					</Nav.List>
				</Collapsible.Panel>
			</BaseCollapsible.Root>
		</Nav.SubItem>
	);
}

/**
 * The folder, open or shut. Both glyphs are here and the open state shows one: Base UI already puts
 * `data-panel-open` on the trigger, so this is read in CSS rather than in a second piece of state.
 */
function FolderGlyph() {
	return (
		<>
			<Folder aria-hidden="true" className="group-data-panel-open:hidden" />
			<FolderOpen aria-hidden="true" className="hidden group-data-panel-open:block" />
		</>
	);
}
```

### src/components/blocks/code-tree/tree.ts

```ts
/**
 * The files a thing is made of, in the shape of the repository.
 *
 * Flat paths in, folders out: a folder exists here exactly when one of the paths lives in it, so
 * the tree can never claim a directory nobody handed over. Nothing here draws anything — the
 * component that does is `Nav`, and this is only what it is handed.
 */

export type CodeTreeNode =
	| { kind: 'folder'; name: string; path: string; children: CodeTreeNode[] }
	| { kind: 'file'; name: string; path: string };

/** A path as the tree reads it: no leading separator and no `./`, so two spellings of one file
 *  are one row. */
export function normalPath(path: string) {
	return path.replace(/^\.\//, '').replace(/^\/+/, '');
}

type Branch = { name: string; path: string; folders: Map<string, Branch>; files: CodeTreeNode[] };

/** Every folder a set of files lives in, each one named by the path `treeOf` gives the same folder. */
export function foldersOf(paths: Iterable<string>): Set<string> {
	const folders = new Set<string>();

	for (const path of paths) {
		const segments = normalPath(path).split('/').slice(0, -1);
		for (let depth = 1; depth <= segments.length; depth += 1) {
			folders.add(segments.slice(0, depth).join('/'));
		}
	}

	return folders;
}

/** Folders before files, each by name, with numbers read as numbers rather than as digits. */
function order(nodes: CodeTreeNode[]): CodeTreeNode[] {
	return nodes.sort((a, b) =>
		a.kind === b.kind
			? a.name.localeCompare(b.name, undefined, { numeric: true })
			: a.kind === 'folder'
				? -1
				: 1,
	);
}

/** Flat paths as the shape a person reads a project in. A path that repeats is drawn once. */
export function treeOf(paths: string[]): CodeTreeNode[] {
	const root: Branch = { name: '', path: '', folders: new Map(), files: [] };

	for (const path of new Set(paths.map(normalPath))) {
		const segments = path.split('/').filter((segment) => segment !== '');
		const name = segments.pop();
		if (name === undefined) continue;

		let branch = root;
		for (const segment of segments) {
			const seen = branch.folders.get(segment);
			if (seen !== undefined) {
				branch = seen;
				continue;
			}
			const created: Branch = {
				name: segment,
				path: branch.path === '' ? segment : `${branch.path}/${segment}`,
				folders: new Map(),
				files: [],
			};
			branch.folders.set(segment, created);
			branch = created;
		}
		branch.files.push({ kind: 'file', name, path });
	}

	const toNodes = (branch: Branch): CodeTreeNode[] =>
		order([
			...[...branch.folders.values()].map((child): CodeTreeNode => ({
				kind: 'folder',
				name: child.name,
				path: child.path,
				children: toNodes(child),
			})),
			...branch.files,
		]);

	return toNodes(root);
}
```

### src/components/blocks/code-tree/glyph.tsx

```tsx
import { createElement } from 'react';
import {
	File,
	FileCode2,
	FileCog,
	FileDiff,
	FileImage,
	FileJson,
	FileLock,
	FileSpreadsheet,
	FileTerminal,
	FileText,
	Palette,
	type LucideIcon,
} from 'lucide-react';

/** A file's glyph, read off its name: the whole name first, then the longest dotted suffix, so
 *  `vite.config.ts` is a config file before it is TypeScript. */
const BY_NAME: Record<string, LucideIcon> = {
	'package.json': FileCog,
	'tsconfig.json': FileCog,
	'jsconfig.json': FileCog,
	'bun.lock': FileLock,
	'bun.lockb': FileLock,
	'yarn.lock': FileLock,
	'package-lock.json': FileLock,
	'pnpm-lock.yaml': FileLock,
};

const BY_SUFFIX: Record<string, LucideIcon> = {
	// Code.
	ts: FileCode2,
	tsx: FileCode2,
	mts: FileCode2,
	cts: FileCode2,
	js: FileCode2,
	jsx: FileCode2,
	mjs: FileCode2,
	cjs: FileCode2,
	vue: FileCode2,
	svelte: FileCode2,
	astro: FileCode2,
	html: FileCode2,
	xml: FileCode2,
	// Styles, and markup that is drawn.
	css: Palette,
	scss: Palette,
	sass: Palette,
	less: Palette,
	svg: FileImage,
	// Data and configuration.
	json: FileJson,
	jsonc: FileJson,
	json5: FileJson,
	yaml: FileCog,
	yml: FileCog,
	toml: FileCog,
	ini: FileCog,
	env: FileCog,
	csv: FileSpreadsheet,
	tsv: FileSpreadsheet,
	// Prose.
	md: FileText,
	mdx: FileText,
	txt: FileText,
	rst: FileText,
	// Shells, patches, locks.
	sh: FileTerminal,
	bash: FileTerminal,
	zsh: FileTerminal,
	fish: FileTerminal,
	ps1: FileTerminal,
	diff: FileDiff,
	patch: FileDiff,
	lock: FileLock,
	// Images.
	png: FileImage,
	jpg: FileImage,
	jpeg: FileImage,
	gif: FileImage,
	webp: FileImage,
	avif: FileImage,
	ico: FileImage,
};

/** The glyph a leaf is drawn with, or a plain file for a type the tables do not know. */
function glyphOf(name: string): LucideIcon {
	const leaf = name.toLowerCase();
	const byName = BY_NAME[leaf];
	if (byName) return byName;

	const segments = leaf.split('.');
	for (let index = 1; index < segments.length; index += 1) {
		const bySuffix = BY_SUFFIX[segments.slice(index).join('.')];
		if (bySuffix) return bySuffix;
	}
	return File;
}

/** The element a row passes as its `icon` — picked per row, so it is built here rather than named
 *  at the call site, where a component chosen during render would be a new one every frame. */
export function fileGlyph(name: string) {
	return createElement(glyphOf(name), { 'aria-hidden': true });
}
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/CodeTree/demos/basic.tsx

```tsx
import { useState } from 'react';
import { CodeTree } from '@/components/blocks/code-tree';

const paths = [
	'src/components/ui/codeTree.tsx',
	'src/components/ui/button.tsx',
	'src/components/ui/spinner.tsx',
	'src/lib/utils.ts',
	'src/styles/lumo-tokens.css',
];

export default function Basic() {
	const [selected, setSelected] = useState(paths[0]!);

	return (
		<div className="w-full max-w-xs space-y-2">
			<div className="max-h-56 overflow-y-auto rounded-lg border p-2">
				<CodeTree paths={paths} selected={selected} onSelect={setSelected} />
			</div>
			<p className="truncate font-mono text-xs text-muted-foreground">{selected}</p>
		</div>
	);
}
```

### src/pages/CodeTree/demos/collapsed.tsx

```tsx
import { CodeTree } from '@/components/blocks/code-tree';

const paths = [
	'src/components/ui/codeTree.tsx',
	'src/components/ui/code.tsx',
	'src/components/ui/code-diff.tsx',
	'src/components/ui/button.tsx',
	'src/lib/utils.ts',
	'src/lib/shiki.ts',
	'package.json',
	'tsconfig.json',
];

export default function Collapsed() {
	return (
		<div className="w-full max-w-xs rounded-lg border p-2">
			<CodeTree paths={paths} size="md" defaultCollapsed={['src/components']} />
		</div>
	);
}
```

### src/pages/CodeTree/demos/primary.tsx

```tsx
import { useState } from 'react';
import { CodeTree } from '@/components/blocks/code-tree';

/** The demo, and the component it shows: what the reader opened the tree for. */
const primary = [
	'src/pages/CodeTree/demos/primary.tsx',
	'src/components/blocks/code-tree/index.tsx',
	'src/components/blocks/code-tree/tree.ts',
	'src/components/blocks/code-tree/glyph.tsx',
];

/** What that component installs around itself. */
const dependencies = [
	'src/components/ui/nav.tsx',
	'src/components/ui/collapsible.tsx',
	'src/lib/utils.ts',
	'src/styles/lumo-tokens.css',
];

/** The folders the dependencies sit in, shut on the first frame: the tree opens on the component. */
const collapsed = ['src/components/ui', 'src/lib', 'src/styles'];

export default function Primary() {
	const [selected, setSelected] = useState(primary[0]!);

	return (
		<div className="w-full max-w-xs space-y-2">
			<div className="max-h-64 overflow-y-auto rounded-lg border p-2">
				<CodeTree
					paths={[...primary, ...dependencies]}
					primary={primary}
					defaultCollapsed={collapsed}
					selected={selected}
					onSelect={setSelected}
				/>
			</div>
			<p className="truncate font-mono text-xs text-muted-foreground">{selected}</p>
		</div>
	);
}
```
