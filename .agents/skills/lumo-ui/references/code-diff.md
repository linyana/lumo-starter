# code-diff

> Two revisions of one file, side by side or stacked, with both line numberings, a per-side change stripe and the additions and deletions counted in the header. Shares Code's header, copy button and highlighting.

## install

```bash
bunx shadcn@latest add @lumo/code-diff
```

- payload: `/r/code-diff.json`
- docs page: `/code-diff`
- comes with it: `@lumo/utils`, `@lumo/code`
- npm packages: `diff`, `tailwind-variants`
- lands in: `code-diff.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/code-diff.tsx

```tsx
import { diffLines } from 'diff';
import { Fragment, useMemo, useRef, type ComponentProps } from 'react';
import type { VariantProps } from 'tailwind-variants';
import {
	Copy,
	Header,
	Tokens,
	codeVariants,
	useCodeLines,
	useComeIntoView,
} from '@/components/ui/code';
import type { CodeLine } from '@/lib/shiki';
import { cn } from '@/lib/utils';

export type DiffKind = 'context' | 'add' | 'delete';

export type DiffLine = {
	kind: DiffKind;
	text: string;
	/** 0-based position in the old file, absent where this line has no old side. */
	old?: number;
	/** 0-based position in the new file, absent where this line has no new side. */
	new?: number;
};

/** One row of the side-by-side view: what the old file had on the left, the new one on the right. */
export type DiffRow = {
	left?: DiffLine;
	right?: DiffLine;
};

export type Diff = {
	lines: DiffLine[];
	rows: DiffRow[];
	additions: number;
	deletions: number;
};

/** Splits a chunk of diff output, dropping only the empty string that a trailing newline leaves. */
function splitLines(value: string): string[] {
	const lines = value.split('\n');
	if (lines.at(-1) === '') lines.pop();
	return lines;
}

/**
 * Pairs the run of removed and added lines between two unchanged ones, so the two files read
 * side by side. A change is not always one-for-one — whichever side runs out ends blank.
 */
function pair(lines: DiffLine[]): DiffRow[] {
	const rows: DiffRow[] = [];
	let index = 0;

	while (index < lines.length) {
		const line = lines[index]!;
		if (line.kind === 'context') {
			rows.push({ left: line, right: line });
			index += 1;
			continue;
		}

		const removed: DiffLine[] = [];
		const added: DiffLine[] = [];
		while (index < lines.length && lines[index]!.kind !== 'context') {
			const changed = lines[index]!;
			(changed.kind === 'delete' ? removed : added).push(changed);
			index += 1;
		}

		for (let at = 0; at < Math.max(removed.length, added.length); at += 1) {
			rows.push({ left: removed[at], right: added[at] });
		}
	}

	return rows;
}

/** Line diff of two files, counted and, for the split view, paired into rows. */
export function diffContent(oldContent: string, newContent: string): Diff {
	const lines: DiffLine[] = [];
	let oldIndex = 0;
	let newIndex = 0;
	let additions = 0;
	let deletions = 0;

	for (const change of diffLines(oldContent, newContent, { ignoreNewlineAtEof: true })) {
		for (const text of splitLines(change.value)) {
			if (change.added) {
				lines.push({ kind: 'add', new: newIndex, text });
				newIndex += 1;
				additions += 1;
			} else if (change.removed) {
				lines.push({ kind: 'delete', old: oldIndex, text });
				oldIndex += 1;
				deletions += 1;
			} else {
				lines.push({ kind: 'context', old: oldIndex, new: newIndex, text });
				oldIndex += 1;
				newIndex += 1;
			}
		}
	}

	return { lines, rows: pair(lines), additions, deletions };
}

/* oxlint-disable react/no-array-index-key -- diff rows are a fixed sequence: a row's identity is its position */

const tone = (kind: DiffKind | undefined) =>
	kind === 'add' ? 'bg-success/10' : kind === 'delete' ? 'bg-destructive/10' : undefined;

const edge = (kind: DiffKind | undefined) =>
	kind === 'add'
		? 'border-success'
		: kind === 'delete'
			? 'border-destructive'
			: 'border-transparent';

type GutterProps = {
	line?: DiffLine;
	/** Which file's numbering this column shows — the same line carries both. */
	side: 'old' | 'new';
};

/** The number column of one side, with the stripe that marks a change on that side. */
function Gutter({ line, side }: GutterProps) {
	const kind = line?.kind;
	const number = side === 'old' ? line?.old : line?.new;

	return (
		<span
			data-slot="code-diff-gutter"
			className={cn(
				'border-l-2 pr-2 pl-3 text-right tabular-nums select-none',
				'text-muted-foreground',
				edge(kind),
				line === undefined ? 'bg-muted/50' : tone(kind),
			)}
		>
			{number === undefined ? '\u200B' : number + 1}
		</span>
	);
}

type ContentProps = {
	line?: DiffLine;
	tokens: CodeLine;
	/** Draws the change sign in its own column, for the stacked view. */
	sign?: boolean;
};

/** One side of a row: the text, plus the sign column when the view stacks the two files. */
function Content({ line, tokens, sign = false }: ContentProps) {
	// A side this line does not exist on keeps the column's shape with a filled, empty cell.
	const background = line === undefined ? 'bg-muted/50' : tone(line.kind);

	return (
		<>
			{sign && (
				<span
					data-slot="code-diff-sign"
					className={cn('w-4 text-center select-none', background)}
				>
					{line?.kind === 'add' ? '+' : line?.kind === 'delete' ? '−' : ''}
				</span>
			)}
			<span data-slot="code-diff-line" className={cn('px-2 whitespace-pre', background)}>
				{line === undefined ? (
					''
				) : tokens.length === 0 ? (
					'\u200B'
				) : (
					<Tokens line={tokens} />
				)}
			</span>
		</>
	);
}

export type CodeDiffProps = Omit<ComponentProps<'div'>, 'children'> &
	VariantProps<typeof codeVariants> & {
		oldContent: string;
		newContent: string;
		language?: string;
		/** Shown in the header instead of the language. */
		fileName?: string;
		view?: 'split' | 'unified';
		copyable?: boolean;
	};

/** Two revisions of one file, side by side or stacked, with the changes counted in the header. */
export function CodeDiff({
	oldContent,
	newContent,
	language,
	fileName,
	view = 'split',
	copyable = true,
	variant = 'outlined',
	className,
	...props
}: CodeDiffProps) {
	const { rows, lines, additions, deletions } = useMemo(
		() => diffContent(oldContent, newContent),
		[oldContent, newContent],
	);
	const block = useRef<HTMLDivElement>(null);
	const near = useComeIntoView(block);
	const oldTokens = useCodeLines(oldContent, language, near);
	const newTokens = useCodeLines(newContent, language, near);

	const tokensAt = (source: CodeLine[], index: number | undefined) =>
		index === undefined ? [] : (source[index] ?? []);

	const title = fileName ?? language ?? 'diff';
	const showHeader = copyable || fileName !== undefined || language !== undefined;

	return (
		<div
			ref={block}
			data-slot="code-diff"
			data-variant={variant}
			data-view={view}
			className={cn(codeVariants({ variant }), className)}
			{...props}
		>
			{showHeader && (
				<Header
					className={variant === 'ghost' ? 'border-b-0' : undefined}
					actions={copyable ? <Copy value={newContent} /> : null}
				>
					<span data-slot="code-diff-title" className="truncate font-medium">
						{title}
					</span>
					<span
						data-slot="code-diff-additions"
						className="shrink-0 tabular-nums text-success"
					>
						+{additions}
					</span>
					<span
						data-slot="code-diff-deletions"
						className="shrink-0 tabular-nums text-destructive"
					>
						−{deletions}
					</span>
				</Header>
			)}
			<div data-slot="code-diff-body" className="min-w-0 overflow-auto py-3">
				<div
					data-slot="code-diff-grid"
					className={cn(
						'grid w-fit min-w-full',
						view === 'split'
							? 'grid-cols-[max-content_auto_max-content_auto]'
							: 'grid-cols-[max-content_max-content_max-content_auto]',
					)}
				>
					{view === 'split'
						? rows.map((row, index) => (
								<Fragment key={index}>
									<Gutter line={row.left} side="old" />
									<Content
										line={row.left}
										tokens={tokensAt(oldTokens, row.left?.old)}
									/>
									<Gutter line={row.right} side="new" />
									<Content
										line={row.right}
										tokens={tokensAt(newTokens, row.right?.new)}
									/>
								</Fragment>
							))
						: lines.map((line, index) => (
								<Fragment key={index}>
									<Gutter line={line} side="old" />
									<Gutter line={line} side="new" />
									<Content
										line={line}
										sign
										tokens={tokensAt(
											line.kind === 'delete' ? oldTokens : newTokens,
											line.kind === 'delete' ? line.old : line.new,
										)}
									/>
								</Fragment>
							))}
				</div>
			</div>
		</div>
	);
}
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/CodeDiff/demos/basic.tsx

```tsx
import { CodeDiff } from '@/components/ui/code-diff';

const before = [
	'export function greet(name: string) {',
	"\tconst parts = name.split(' ');",
	"\treturn 'hello, ' + parts[0];",
	'}',
	'',
	'export const version = 1;',
].join('\n');

const after = [
	'export function greet(name: string) {',
	"\tconst parts = name.trim().split(' ');",
	'\tconst first = parts[0] ?? name;',
	'\treturn `hello, ${first}`;',
	'}',
	'',
	'export const version = 2;',
].join('\n');

export default function Basic() {
	return (
		<CodeDiff
			oldContent={before}
			newContent={after}
			language="ts"
			fileName="greet.ts"
			className="w-full"
		/>
	);
}
```

### src/pages/CodeDiff/demos/added.tsx

```tsx
import { CodeDiff } from '@/components/ui/code-diff';

const before = ['export const name =', "\t'lumo-ui';"].join('\n');

const added = ['export function farewell(name: string) {', '\treturn `bye, ${name}`;', '}'].join(
	'\n',
);

export default function Added() {
	return (
		<CodeDiff
			oldContent={before}
			newContent={`${before}\n\n${added}`}
			language="ts"
			fileName="name.ts"
			className="w-full"
		/>
	);
}
```

### src/pages/CodeDiff/demos/scroll.tsx

```tsx
import { CodeDiff } from '@/components/ui/code-diff';

const fields = Array.from({ length: 16 }, (_, index) => `'field-${index + 1}'`).join(', ');
const before = `export const fields = [${fields}];`;
const after = before.replace('field-16', 'updated-field-16');

export default function Scroll() {
	return (
		<div className="w-full min-w-0 space-y-4">
			<CodeDiff oldContent={before} newContent={after} language="ts" fileName="fields.ts" />
			<CodeDiff
				oldContent={before}
				newContent={after}
				language="ts"
				fileName="fields.ts"
				view="unified"
			/>
		</div>
	);
}
```

### src/pages/CodeDiff/demos/surfaces.tsx

```tsx
import { CodeDiff } from '@/components/ui/code-diff';

const before = "export const theme = 'light';";
const after = "export const theme = 'dark';";

const variants = ['filled', 'ghost'] as const;

export default function Surfaces() {
	return (
		<div className="w-full space-y-3">
			{variants.map((variant) => (
				<CodeDiff
					key={variant}
					oldContent={before}
					newContent={after}
					language="ts"
					fileName={`${variant}.ts`}
					variant={variant}
				/>
			))}
		</div>
	);
}
```

### src/pages/CodeDiff/demos/unified.tsx

```tsx
import { CodeDiff } from '@/components/ui/code-diff';

const before = ['const retries = 1;', 'export { retries };'].join('\n');
const after = ['const retries = 3;', 'export { retries };'].join('\n');

export default function Unified() {
	return (
		<CodeDiff
			oldContent={before}
			newContent={after}
			language="ts"
			fileName="retries.ts"
			view="unified"
			className="w-full"
		/>
	);
}
```
