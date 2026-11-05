# utils

> clsx + tailwind-merge. Required by every component; installed automatically as a dependency.

## install

```bash
bunx shadcn@latest add @lumo/utils
```

- payload: `/r/utils.json`
- npm packages: `clsx`, `tailwind-merge`
- lands in: `utils.ts` under the project's `aliases.lib`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/lib/utils.ts

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** clsx + tailwind-merge. Local copy so the library installs into any project. */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```
