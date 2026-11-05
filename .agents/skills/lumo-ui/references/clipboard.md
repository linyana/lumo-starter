# clipboard

> A copy button's two halves — the write, and the moment of 'copied' that says it landed — so every copy in the library forgets at the same speed and none of them claims a copy the clipboard refused.

## install

```bash
bunx shadcn@latest add @lumo/clipboard
```

- payload: `/r/clipboard.json`
- lands in: `clipboard.ts` under the project's `aliases.lib`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/lib/clipboard.ts

```ts
import { useCallback, useEffect, useState } from 'react';

/**
 * A copy button's two halves, in one place: the write, and the moment of "copied" that says it
 * landed. Every copy in the library — a code block, a diff, a file in a tree — is this hook and a
 * glyph, so they all forget at the same speed and none of them claims a copy the clipboard refused.
 *
 * `value` may be a function, for a copy that has to go and read what it is copying; nothing is said
 * if that comes back empty.
 */
export function useCopy(timeout = 1600) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), timeout);
		return () => clearTimeout(timer);
	}, [copied, timeout]);

	const copy = useCallback(
		async (value: string | (() => string | undefined | Promise<string | undefined>)) => {
			const text = typeof value === 'function' ? await value() : value;
			if (text === undefined) return;

			try {
				await navigator.clipboard.writeText(text);
				setCopied(true);
			} catch {
				// A clipboard the page may not write to. The button says nothing, which is honest:
				// a tick after a copy that never happened is worse than no tick at all.
			}
		},
		[],
	);

	return { copied, copy } as const;
}
```
