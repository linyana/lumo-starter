# code

> Highlighted source with optional line numbers, bare by default so Card can supply the surface, title and actions. Exports a reusable copy button and an opt-in header. Shiki grammars load only when needed; unknown languages fall back to plain text.

## install

```bash
bunx shadcn@latest add @lumo/code
```

- payload: `/r/code.json`
- docs page: `/code`
- comes with it: `@lumo/utils`, `@lumo/button`, `@lumo/shiki`, `@lumo/clipboard`
- npm packages: `shiki`, `lucide-react`, `tailwind-variants`
- lands in: `code.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/code.tsx

```tsx
import { Check, Copy as CopyIcon } from 'lucide-react';
import {
	useEffect,
	useMemo,
	useRef,
	useState,
	type ComponentProps,
	type CSSProperties,
	type ReactNode,
	type RefObject,
	Fragment,
} from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCopy } from '@/lib/clipboard';
import { type CodeLine, highlight, highlighted, whenIdle } from '@/lib/shiki';
import { tv, type VariantProps } from 'tailwind-variants';

export type CopyProps = {
	value: string;
	className?: string;
};

/** Copies `value`, then says so for a moment. Silently does nothing where the clipboard is denied. */
export function Copy({ value, className }: CopyProps) {
	const { copied, copy } = useCopy();

	return (
		<Button
			data-slot="code-copy"
			size="icon"
			variant="ghost"
			icon={copied ? <Check /> : <CopyIcon />}
			aria-label={copied ? 'copied' : 'copy code'}
			className={cn('size-7', className)}
			onClick={() => void copy(value)}
		/>
	);
}

export type HeaderProps = {
	/** What the block is: a file name, a language, a count. */
	children?: ReactNode;
	/** What you can do with it, right-aligned. */
	actions?: ReactNode;
	className?: string;
};

/** The bar above a block of code, shared by `Code` and `CodeDiff`. */
export function Header({ children, actions, className }: HeaderProps) {
	return (
		<div
			data-slot="code-header"
			className={cn(
				'flex min-h-9 items-center justify-between gap-3 border-b px-3 py-1',
				className,
			)}
		>
			<div className="flex min-w-0 items-center gap-2 text-xs">{children}</div>
			<div className="flex shrink-0 items-center gap-1">{actions}</div>
		</div>
	);
}

/* oxlint-disable react/no-array-index-key -- a token is identified by where it sits in the line, and nothing else */

export type TokensProps = {
	line: CodeLine;
};

/**
 * One highlighted line. Colour arrives as two custom properties and is chosen by the `dark`
 * variant rather than by JS, so switching themes repaints without re-tokenising anything.
 */
export function Tokens({ line }: TokensProps) {
	return line.map((token, index) => (
		<span
			key={index}
			data-slot="code-token"
			className={cn(
				token.light && token.dark && 'text-(--code-light) dark:text-(--code-dark)',
				token.italic && 'italic',
				token.bold && 'font-bold',
				token.underline && 'underline',
			)}
			style={
				{
					'--code-light': token.light,
					'--code-dark': token.dark,
				} as CSSProperties
			}
		>
			{token.content}
		</span>
	));
}

type Result = { source: string; language: string | undefined; lines: CodeLine[] };

/** The code as plain, unstyled lines — what shows before the grammar arrives, and if it fails. */
function plain(code: string): CodeLine[] {
	return code.split('\n').map((line) => (line === '' ? [] : [{ content: line }]));
}

/**
 * Whether `element` has come close enough to the viewport to be worth painting. Once it has, it stays
 * that way: a block a reader has scrolled past does not go back to plain text behind them.
 */
export function useComeIntoView(element: RefObject<HTMLElement | null>, margin = '300px') {
	const [near, setNear] = useState(false);

	useEffect(() => {
		const node = element.current;
		if (node === null || near) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) setNear(true);
			},
			{ rootMargin: `${margin} 0px` },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [element, margin, near]);

	return near;
}

/**
 * Highlighted lines for `code`. The result is tagged with what produced it, so a change of `code`
 * shows plain text for a frame instead of the previous block's colours — unless that snippet has
 * been highlighted before, in which case its colours are already here and there is no frame to lose.
 *
 * Tokenising waits for an idle slice, one block at a time, and for the block to be close to the
 * viewport: the plain text is the same shape and does not move when the colours arrive, so nothing
 * is lost by letting the page paint first. A block that is off the page, behind another tab or left
 * before its turn never tokenises at all — which on a page of source is most of them.
 */
export function useCodeLines(code: string, language?: string, enabled = true): CodeLine[] {
	const [result, setResult] = useState<Result | null>(null);

	useEffect(() => {
		if (!enabled) return;

		let live = true;
		const drop = whenIdle(() => {
			highlight(code, language).then(
				(lines) => {
					if (live) setResult({ source: code, language, lines });
				},
				() => {},
			);
		});

		return () => {
			live = false;
			drop();
		};
	}, [code, language, enabled]);

	return useMemo(() => {
		if (result?.source === code && result.language === language) return result.lines;
		return highlighted(code, language) ?? plain(code);
	}, [code, language, result]);
}

/* oxlint-disable react/no-array-index-key -- a line of code is identified by its position, which is also its number */

/**
 * A block of source and the measure a source is read at: one tab is two spaces, because the file is
 * written in tabs and a browser's default of eight would open every level into a gulf. The property
 * is inherited, so every `pre` and every diff line under the frame is drawn at it.
 */
export const codeVariants = tv({
	base: ['w-full overflow-hidden rounded-lg font-mono text-sm leading-5 [tab-size:2]'],
	variants: {
		variant: {
			filled: 'bg-muted',
			outlined: 'border bg-background',
			ghost: 'bg-transparent',
		},
	},
	defaultVariants: {
		variant: 'ghost',
	},
});

export type CodeProps = Omit<ComponentProps<'div'>, 'children'> &
	VariantProps<typeof codeVariants> & {
		code: string;
		/** Grammar to highlight with. Anything we do not ship falls back to plain text. */
		language?: string;
		/** Shown in the header instead of the language. */
		fileName?: string;
		showLineNumbers?: boolean;
		/** Wrap long lines instead of scrolling them sideways. */
		wrap?: boolean;
		copyable?: boolean;
		/** Opt into the built-in title and copy bar; omitted by default for external composition. */
		header?: boolean;
	};

/** Highlighted source, bare by default so a surrounding surface can own its title and actions. */
export function Code({
	code,
	language,
	fileName,
	variant = 'ghost',
	showLineNumbers = false,
	wrap = false,
	copyable = true,
	header = false,
	className,
	...props
}: CodeProps) {
	const block = useRef<HTMLDivElement>(null);
	const near = useComeIntoView(block);
	const lines = useCodeLines(code, language, near);
	const title = fileName ?? language ?? 'code';
	const showHeader = header && (copyable || fileName !== undefined || language !== undefined);
	// Without line numbers the text is the only column. With them the number column is
	// `max-content`, so it takes exactly its widest number and no share of the leftover space;
	// wrapped text needs `minmax(0,1fr)` to fold instead of overflow.
	const columns = !showLineNumbers
		? 'grid-cols-1'
		: wrap
			? 'grid-cols-[max-content_minmax(0,1fr)]'
			: 'grid-cols-[max-content_auto]';

	return (
		<div
			ref={block}
			data-slot="code"
			data-variant={variant}
			className={cn(codeVariants({ variant }), className)}
			{...props}
		>
			{showHeader && (
				<Header
					className={variant === 'ghost' ? 'border-b-0' : undefined}
					actions={copyable ? <Copy value={code} /> : null}
				>
					<span data-slot="code-title" className="truncate font-medium">
						{title}
					</span>
					{fileName !== undefined && language !== undefined && (
						<span data-slot="code-language" className="truncate text-muted-foreground">
							{language}
						</span>
					)}
				</Header>
			)}
			<pre data-slot="code-body" className="overflow-auto py-3">
				<code
					className={cn(
						'grid',
						columns,
						wrap ? 'w-full' : 'w-fit min-w-full',
						!showLineNumbers && 'pl-4',
					)}
				>
					{lines.map((line, index) => (
						<Fragment key={index}>
							{showLineNumbers && (
								<span
									data-slot="code-line-number"
									className="pr-2 pl-3 text-right text-muted-foreground select-none"
								>
									{index + 1}
								</span>
							)}
							<span
								data-slot="code-line"
								className={cn(
									'pr-4',
									wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre',
								)}
							>
								{line.length === 0 ? '\u200B' : <Tokens line={line} />}
							</span>
						</Fragment>
					))}
				</code>
			</pre>
		</div>
	);
}
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Code/demos/basic.tsx

```tsx
import { Card } from '@/components/ui/card';
import { Code, Copy } from '@/components/ui/code';

const source = [
	"import { clsx, type ClassValue } from 'clsx';",
	"import { twMerge } from 'tailwind-merge';",
	'',
	'/** Merges class names, last one wins. */',
	'export function cn(...inputs: ClassValue[]) {',
	'\treturn twMerge(clsx(inputs));',
	'}',
].join('\n');

export default function Basic() {
	return (
		<Card.Root className="w-full gap-0 overflow-hidden py-0">
			<Card.Header className="min-h-9 border-b border-border/50 px-3 py-1">
				<Card.Title className="font-mono text-xs font-medium">cn.ts</Card.Title>
				<Card.Action>
					<Copy value={source} />
				</Card.Action>
			</Card.Header>
			<Card.Content className="min-w-0 px-0">
				<Code code={source} language="ts" />
			</Card.Content>
		</Card.Root>
	);
}
```

### src/pages/Code/demos/line-numbers.tsx

```tsx
import { Card } from '@/components/ui/card';
import { Code, Copy } from '@/components/ui/code';

const source = [
	'export function clamp(value: number, min: number, max: number) {',
	'\treturn Math.min(Math.max(value, min), max);',
	'}',
].join('\n');

export default function LineNumbers() {
	return (
		<Card.Root className="w-full gap-0 overflow-hidden py-0">
			<Card.Header className="min-h-9 border-b border-border/50 px-3 py-1">
				<Card.Title className="font-mono text-xs font-medium">clamp.ts</Card.Title>
				<Card.Action>
					<Copy value={source} />
				</Card.Action>
			</Card.Header>
			<Card.Content className="min-w-0 px-0">
				<Code code={source} language="ts" showLineNumbers />
			</Card.Content>
		</Card.Root>
	);
}
```

### src/pages/Code/demos/surfaces.tsx

```tsx
import { Card } from '@/components/ui/card';
import { Code, Copy } from '@/components/ui/code';

const source = ['export const name =', "\t'lumo-ui';"].join('\n');

export default function Surfaces() {
	return (
		<div className="w-full space-y-3">
			<Card.Root className="gap-0 overflow-hidden bg-muted py-0 shadow-none">
				<Card.Header className="min-h-9 border-b border-border/50 px-3 py-1">
					<Card.Title className="font-mono text-xs font-medium">filled</Card.Title>
					<Card.Action>
						<Copy value={source} />
					</Card.Action>
				</Card.Header>
				<Card.Content className="min-w-0 px-0">
					<Code code={source} language="ts" />
				</Card.Content>
			</Card.Root>
			<Card.Root className="gap-0 overflow-hidden py-0">
				<Card.Header className="min-h-9 border-b border-border/50 px-3 py-1">
					<Card.Title className="font-mono text-xs font-medium">card</Card.Title>
					<Card.Action>
						<Copy value={source} />
					</Card.Action>
				</Card.Header>
				<Card.Content className="min-w-0 px-0">
					<Code code={source} language="ts" />
				</Card.Content>
			</Card.Root>
			<Code code={source} language="ts" />
		</div>
	);
}
```

### src/pages/Code/demos/unknown.tsx

```tsx
import { Card } from '@/components/ui/card';
import { Code, Copy } from '@/components/ui/code';

const source = '++[>+<-]\n// a grammar we do not ship';

export default function Unknown() {
	return (
		<Card.Root className="w-full gap-0 overflow-hidden py-0">
			<Card.Header className="min-h-9 border-b border-border/50 px-3 py-1">
				<Card.Title className="font-mono text-xs font-medium">hello.bf</Card.Title>
				<Card.Action>
					<Copy value={source} />
				</Card.Action>
			</Card.Header>
			<Card.Content className="min-w-0 px-0">
				<Code code={source} language="brainfuck" />
			</Card.Content>
		</Card.Root>
	);
}
```

### src/pages/Code/demos/wrap.tsx

```tsx
import { Card } from '@/components/ui/card';
import { Code, Copy } from '@/components/ui/code';

const source = [
	'const message =',
	"\t'every line here is longer than the block it sits in, which is the whole point of the demo';",
	'export default message;',
].join('\n');

export default function Wrap() {
	return (
		<div className="w-full space-y-3">
			{[false, true].map((wrap) => (
				<Card.Root key={String(wrap)} className="gap-0 overflow-hidden py-0">
					<Card.Header className="min-h-9 border-b border-border/50 px-3 py-1">
						<Card.Title className="font-mono text-xs font-medium">
							{wrap ? 'wrap.ts' : 'scroll.ts'}
						</Card.Title>
						<Card.Action>
							<Copy value={source} />
						</Card.Action>
					</Card.Header>
					<Card.Content className="min-w-0 px-0">
						<Code code={source} language="ts" wrap={wrap} />
					</Card.Content>
				</Card.Root>
			))}
		</div>
	);
}
```
