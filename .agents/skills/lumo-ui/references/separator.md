# separator

> A line between two regions, horizontal or vertical, announced as a separator. Behaviour from Base UI, appearance from tokens.

## install

```bash
bunx shadcn@latest add @lumo/separator
```

- payload: `/r/separator.json`
- docs page: `/separator`
- comes with it: `@lumo/utils`
- npm packages: `@base-ui/react`
- lands in: `separator.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/separator.tsx

```tsx
import type { ComponentProps } from 'react';
import { Separator as BaseSeparator } from '@base-ui/react/separator';
import { cn } from '@/lib/utils';

export type SeparatorProps = ComponentProps<typeof BaseSeparator>;

export function Separator({ className, orientation = 'horizontal', ...props }: SeparatorProps) {
	return (
		<BaseSeparator
			data-slot="separator"
			orientation={orientation}
			className={cn(
				'shrink-0 bg-border',
				orientation === 'horizontal' ? 'h-px w-full' : 'w-px self-stretch',
				className,
			)}
			{...props}
		/>
	);
}
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Separator/demos/basic.tsx

```tsx
import { Separator } from '@/components/ui/separator';

export default function Basic() {
	return (
		<div className="w-full max-w-sm rounded-lg border p-4 text-sm">
			<div>project settings</div>
			<Separator className="my-3" />
			<div className="flex items-center gap-3 text-xs text-muted-foreground">
				<span>3 members</span>
				<Separator orientation="vertical" className="h-4" />
				<span>updated today</span>
			</div>
		</div>
	);
}
```

### src/pages/Separator/demos/between-rows.tsx

```tsx
import { Separator } from '@/components/ui/separator';

const rows = [
	{ label: 'name', value: 'lumo-ui' },
	{ label: 'layer', value: 'ui' },
	{ label: 'behaviour', value: 'Base UI' },
];

export default function BetweenRows() {
	return (
		<div className="w-full max-w-sm rounded-lg border text-sm">
			{rows.map(({ label, value }, index) => (
				<div key={label}>
					{index > 0 && <Separator />}
					<div className="flex items-baseline justify-between gap-3 px-4 py-2.5">
						<span className="text-muted-foreground">{label}</span>
						<span className="font-mono">{value}</span>
					</div>
				</div>
			))}
		</div>
	);
}
```
