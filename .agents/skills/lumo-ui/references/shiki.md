# shiki

> The highlighter behind Code and CodeDiff: one shared core, a grammar per file fetched on demand, a light/dark colour pair per token so the theme can flip without re-tokenising, and a cache so the same snippet is tokenised once however many blocks show it.

## install

```bash
bunx shadcn@latest add @lumo/shiki
```

- payload: `/r/shiki.json`
- npm packages: `shiki`
- lands in: `shiki.ts` under the project's `aliases.lib`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/lib/shiki.ts

```ts
import { createHighlighterCore, type DynamicImportLanguageRegistration } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

/** A run of text sharing one style. Two colours because the theme follows `.dark`, not JS. */
export type CodeToken = {
	content: string;
	light?: string;
	dark?: string;
	italic?: boolean;
	bold?: boolean;
	underline?: boolean;
};

export type CodeLine = CodeToken[];

/** One grammar per file, so a consumer downloads only the languages it actually highlights. */
const languages: Record<string, DynamicImportLanguageRegistration> = {
	bash: () => import('shiki/langs/bash.mjs'),
	c: () => import('shiki/langs/c.mjs'),
	cpp: () => import('shiki/langs/cpp.mjs'),
	csharp: () => import('shiki/langs/csharp.mjs'),
	css: () => import('shiki/langs/css.mjs'),
	diff: () => import('shiki/langs/diff.mjs'),
	docker: () => import('shiki/langs/docker.mjs'),
	go: () => import('shiki/langs/go.mjs'),
	graphql: () => import('shiki/langs/graphql.mjs'),
	html: () => import('shiki/langs/html.mjs'),
	java: () => import('shiki/langs/java.mjs'),
	javascript: () => import('shiki/langs/javascript.mjs'),
	json: () => import('shiki/langs/json.mjs'),
	jsonc: () => import('shiki/langs/jsonc.mjs'),
	kotlin: () => import('shiki/langs/kotlin.mjs'),
	less: () => import('shiki/langs/less.mjs'),
	lua: () => import('shiki/langs/lua.mjs'),
	markdown: () => import('shiki/langs/markdown.mjs'),
	php: () => import('shiki/langs/php.mjs'),
	python: () => import('shiki/langs/python.mjs'),
	ruby: () => import('shiki/langs/ruby.mjs'),
	rust: () => import('shiki/langs/rust.mjs'),
	scss: () => import('shiki/langs/scss.mjs'),
	shellscript: () => import('shiki/langs/shellscript.mjs'),
	sql: () => import('shiki/langs/sql.mjs'),
	svelte: () => import('shiki/langs/svelte.mjs'),
	swift: () => import('shiki/langs/swift.mjs'),
	toml: () => import('shiki/langs/toml.mjs'),
	tsx: () => import('shiki/langs/tsx.mjs'),
	typescript: () => import('shiki/langs/typescript.mjs'),
	vue: () => import('shiki/langs/vue.mjs'),
	xml: () => import('shiki/langs/xml.mjs'),
	yaml: () => import('shiki/langs/yaml.mjs'),
};

/** The spellings people write, mapped onto the grammar that handles them. */
const aliases: Record<string, string> = {
	js: 'javascript',
	jsx: 'javascript',
	ts: 'typescript',
	sh: 'bash',
	shell: 'bash',
	zsh: 'bash',
	py: 'python',
	yml: 'yaml',
	md: 'markdown',
	rb: 'ruby',
	rs: 'rust',
	kt: 'kotlin',
	cs: 'csharp',
	'c++': 'cpp',
	'c#': 'csharp',
	gql: 'graphql',
};

const themes = { light: 'github-light', dark: 'github-dark' } as const;

/** `FontStyle` from vscode-textmate, which shiki reuses verbatim — a bitmask, not a list. */
const ITALIC = 1;
const BOLD = 2;
const UNDERLINE = 4;

/** The grammar to highlight `language` with, or `text` when we ship nothing for it. */
export function resolveLanguage(language: string | undefined): string {
	const name = language?.trim().toLowerCase() ?? '';
	if (Object.hasOwn(languages, name)) return name;
	return aliases[name] ?? 'text';
}

let pending: Promise<Awaited<ReturnType<typeof createHighlighterCore>>> | undefined;

/**
 * One highlighter for the whole page. Its grammars arrive on demand, and a failure clears the
 * cached promise so the next block retries instead of inheriting a dead one.
 */
function highlighter() {
	pending ??= createHighlighterCore({
		engine: createJavaScriptRegexEngine(),
		themes: [
			() => import('shiki/themes/github-light.mjs'),
			() => import('shiki/themes/github-dark.mjs'),
		],
		langs: [],
	}).catch((error: unknown) => {
		pending = undefined;
		throw error;
	});
	return pending;
}

/** A snippet that has been highlighted, by language and source: the same source twice is one pass. */
const done = new Map<string, CodeLine[]>();

/** The same, still running — two blocks of one snippet wait on a single pass rather than two. */
const flying = new Map<string, Promise<CodeLine[]>>();

/** Enough for a page and the page after it; a snippet is small, a map of them is smaller than a grammar. */
const KEEP = 200;

function keyOf(code: string, language: string | undefined) {
	return `${resolveLanguage(language)}\u0000${code}`;
}

/**
 * The lines for this snippet if they are already known, without waiting. A component that remounts —
 * a route that comes back, a fold that reopens — can paint colours on the first frame instead of a
 * frame of plain text and then a jump.
 */
export function highlighted(code: string, language?: string): CodeLine[] | undefined {
	return done.get(keyOf(code, language));
}

function remember(key: string, lines: CodeLine[]) {
	done.set(key, lines);
	if (done.size <= KEEP) return;
	const oldest = done.keys().next().value;
	if (oldest !== undefined) done.delete(oldest);
}

/**
 * `task` runs when the browser is between paints, one task per idle slice. A page of source arriving
 * at once — a route change mounts a dozen blocks — would otherwise block the paint the click asked
 * for, and the block a reader is about to leave would get the same time as the one they came to.
 * The returned function drops the task if it has not started: that is what makes a fast click cheap.
 */
export function whenIdle(task: () => void): () => void {
	const entry = { task };
	queued.push(entry);
	plan();

	return () => {
		const index = queued.indexOf(entry);
		if (index !== -1) queued.splice(index, 1);
	};
}

const queued: Array<{ task: () => void }> = [];
let planned = false;

function plan() {
	if (planned || queued.length === 0 || typeof window === 'undefined') return;
	planned = true;

	const run = () => {
		planned = false;
		queued.shift()?.task();
		plan();
	};

	// The timeout is what guarantees progress: an idle callback is a promise, not a queue position.
	if (typeof window.requestIdleCallback === 'function')
		window.requestIdleCallback(run, { timeout: 300 });
	else setTimeout(run, 16);
}

/** `code` split into styled lines. Never rejects on an unknown language — it falls back to text. */
export async function highlight(code: string, language?: string): Promise<CodeLine[]> {
	const key = keyOf(code, language);
	const known = done.get(key);
	if (known !== undefined) return known;

	const running = flying.get(key);
	if (running !== undefined) return running;

	const pass = tokenise(code, language).then((lines) => {
		remember(key, lines);
		return lines;
	});
	flying.set(key, pass);
	try {
		return await pass;
	} finally {
		flying.delete(key);
	}
}

async function tokenise(code: string, language?: string): Promise<CodeLine[]> {
	const name = resolveLanguage(language);
	const core = await highlighter();
	const load = Object.hasOwn(languages, name) ? languages[name] : undefined;
	if (load) await core.loadLanguage(load);

	const lines = core.codeToTokensWithThemes(code, {
		lang: load ? name : 'text',
		themes,
	});

	return lines.map((line) =>
		line.map((token) => {
			const light = token.variants.light;
			const dark = token.variants.dark;
			const style = (light?.fontStyle ?? 0) | (dark?.fontStyle ?? 0);

			return {
				content: token.content,
				light: light?.color,
				dark: dark?.color,
				italic: (style & ITALIC) !== 0,
				bold: (style & BOLD) !== 0,
				underline: (style & UNDERLINE) !== 0,
			};
		}),
	);
}
```
