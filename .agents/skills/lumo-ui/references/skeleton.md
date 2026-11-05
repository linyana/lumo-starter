# skeleton

> Placeholder for content that has not arrived. Give it the size the real content will be.

## install

```bash
bunx shadcn@latest add @lumo/skeleton
```

- payload: `/r/skeleton.json`
- docs page: `/skeleton`
- comes with it: `@lumo/utils`
- lands in: `skeleton.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/skeleton.tsx

```tsx
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SkeletonProps = ComponentProps<'div'>;

/** Placeholder for content that has not arrived. Give it the size the real content will be. */
export function Skeleton({ className, ...props }: SkeletonProps) {
	return (
		<div
			data-slot="skeleton"
			className={cn(
				'animate-pulse rounded-md bg-muted motion-reduce:animate-none',
				className,
			)}
			{...props}
		/>
	);
}
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Skeleton/demos/basic.tsx

```tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function Basic() {
	return (
		<div className="flex w-full max-w-sm flex-col gap-2">
			<Skeleton className="h-4 w-2/3" />
			<Skeleton className="h-4 w-full" />
			<Skeleton className="h-4 w-4/5" />
		</div>
	);
}
```

### src/pages/Skeleton/demos/card.tsx

```tsx
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/** The same card twice: what arrives, and what stands in for it while it does. */
export default function CardPlaceholder() {
	return (
		<div className="flex w-full max-w-xl flex-wrap items-stretch gap-3">
			<Card.Root className="flex-1">
				<Card.Header>
					<Card.Title>api keys</Card.Title>
					<Card.Description>two of them, both read-only.</Card.Description>
				</Card.Header>
				<Card.Content className="text-sm text-muted-foreground">
					rotated 12 days ago
				</Card.Content>
				<Card.Footer className="justify-end">
					<Skeleton className="h-7 w-16 rounded-md" />
				</Card.Footer>
			</Card.Root>
			<Card.Root className="flex-1">
				<Card.Header>
					<Skeleton className="h-4 w-1/2" />
					<Skeleton className="h-3 w-2/3" />
				</Card.Header>
				<Card.Content>
					<Skeleton className="h-3 w-1/3" />
				</Card.Content>
				<Card.Footer className="justify-end">
					<Skeleton className="h-7 w-16 rounded-md" />
				</Card.Footer>
			</Card.Root>
		</div>
	);
}
```

### src/pages/Skeleton/demos/swap.tsx

```tsx
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const rows = ['alien-bean-pasta.md', 'wild-irish-burrito.md', 'horse-battery-staple.md'];

/** The placeholder is the answer's own shape, so nothing under it moves when the answer lands. */
export default function Swap() {
	const [arrived, setArrived] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setArrived(true), 1400);
		return () => clearTimeout(timer);
	}, []);

	return (
		<div className="w-full max-w-sm space-y-3">
			<div className="rounded-lg border p-3">
				{arrived ? (
					<ul className="divide-y">
						{rows.map((row) => (
							<li
								key={row}
								className="flex items-baseline justify-between gap-3 py-1.5 font-mono text-sm first:pt-0 last:pb-0"
							>
								{row}
								<span className="text-xs text-muted-foreground">4 kb</span>
							</li>
						))}
					</ul>
				) : (
					<div className="divide-y">
						{rows.map((row) => (
							<div
								key={row}
								className="flex items-center justify-between gap-3 py-1.5 first:pt-0 last:pb-0"
							>
								<Skeleton className="h-4 w-40" />
								<Skeleton className="h-3 w-8" />
							</div>
						))}
					</div>
				)}
			</div>
			<p className="text-sm text-muted-foreground">
				three rows in, three rows out: the box is the same height before and after.
			</p>
		</div>
	);
}
```
