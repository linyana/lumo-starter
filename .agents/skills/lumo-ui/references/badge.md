# badge

> A word that labels the thing beside it. Three surface fills taken from Button, and four outcomes drawn as a tint of their own colour rather than as a solid block, because an outcome is a fact to be read.

## install

```bash
bunx shadcn@latest add @lumo/badge
```

- payload: `/r/badge.json`
- docs page: `/badge`
- comes with it: `@lumo/utils`, `@lumo/control`
- npm packages: `tailwind-variants`
- lands in: `badge.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/badge.tsx

```tsx
import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { iconSlot } from '@/lib/control';

/**
 * A word that labels something it sits beside. The three surface variants are the fills a button
 * already has, because a badge next to a control should read as the same family; the four outcomes
 * are a tint of their own colour rather than a fill, because an outcome is a fact to be read and a
 * solid block would make it look pressable.
 */
export const badgeVariants = tv({
	base: [
		'inline-flex shrink-0 items-center gap-1 align-middle whitespace-nowrap',
		'rounded-sm border border-transparent px-1.5 py-0.5',
		'text-xs leading-4 font-medium',
		iconSlot,
	],
	variants: {
		variant: {
			default: 'bg-primary text-primary-foreground',
			secondary: 'bg-secondary text-secondary-foreground',
			outline: 'border-border text-foreground',
			destructive: 'bg-destructive/10 text-destructive',
			success: 'bg-success/10 text-success',
			warning: 'bg-warning/10 text-warning',
			info: 'bg-info/10 text-info',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

export type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
	return (
		<span
			data-slot="badge"
			data-variant={variant}
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Badge/demos/basic.tsx

```tsx
import { Badge } from '@/components/ui/badge';

export default function Basic() {
	return (
		<div className="flex flex-wrap items-center justify-center gap-2">
			<Badge>new</Badge>
			<Badge variant="secondary">draft</Badge>
			<Badge variant="outline">archived</Badge>
			<Badge variant="success">passed</Badge>
			<Badge variant="warning">waiting</Badge>
			<Badge variant="info">beta</Badge>
			<Badge variant="destructive">failed</Badge>
		</div>
	);
}
```

### src/pages/Badge/demos/rows.tsx

```tsx
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const runs = [
	{ name: 'unit tests', outcome: 'passed', variant: 'success' as const, note: '1m 04s' },
	{ name: 'deploy', outcome: 'waiting', variant: 'warning' as const, note: 'needs review' },
	{ name: 'e2e', outcome: 'failed', variant: 'destructive' as const, note: '3 specs' },
	{ name: 'docs', outcome: 'queued', variant: 'info' as const, note: 'in 2 runs' },
];

export default function Rows() {
	return (
		<div className="w-full max-w-sm rounded-lg border px-3">
			{runs.map((run, index) => (
				<div key={run.name}>
					{index > 0 && <Separator />}
					<div className="flex items-center justify-between gap-3 py-2 text-sm">
						<span className="truncate">{run.name}</span>
						<div className="flex shrink-0 items-center gap-2">
							<span className="text-muted-foreground">{run.note}</span>
							<Badge variant={run.variant}>{run.outcome}</Badge>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
```
