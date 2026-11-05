# input

> A single line of text in the same 32 / 36 / 40 tiers a Button takes, so the two line up. Registers itself with a surrounding Field and reads the invalid border off it.

## install

```bash
bunx shadcn@latest add @lumo/input
```

- payload: `/r/input.json`
- docs page: `/input`
- comes with it: `@lumo/utils`, `@lumo/control`
- npm packages: `@base-ui/react`, `tailwind-variants`
- lands in: `input.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/input.tsx

```tsx
import { Input as BaseInput } from '@base-ui/react/input';
import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { fieldShell } from '@/lib/control';

export const inputVariants = tv({
	base: [
		fieldShell,
		// A field that is settled rather than edited: still selectable, so still a field, but it reads
		// as a value being shown.
		'read-only:bg-muted',
		// A file input is a field with a button in it; the button is the browser's, so its shape is
		// settled here rather than in a part.
		'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
	],
	variants: {
		size: {
			sm: 'h-8 px-2.5 text-sm',
			md: 'h-9 px-3 text-sm',
			lg: 'h-10 px-3.5 text-base',
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

export type InputProps = Omit<ComponentProps<typeof BaseInput>, 'className' | 'size'> &
	VariantProps<typeof inputVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
	};

/**
 * A single line of text. `size` is its height — the same 32/36/40 a Button takes, so the two line
 * up in a row — and never the browser's character count: the width comes from the container.
 */
export function Input({ className, size = 'md', ...props }: InputProps) {
	return (
		<BaseInput
			data-slot="input"
			data-size={size}
			className={cn(inputVariants({ size }), className)}
			{...props}
		/>
	);
}
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Input/demos/basic.tsx

```tsx
import { Input } from '@/components/ui/input';

export default function Basic() {
	return (
		<div className="flex w-full max-w-sm flex-col gap-2">
			<Input placeholder="a single line of text" aria-label="a single line of text" />
			<Input type="password" defaultValue="hunter2" aria-label="password" />
		</div>
	);
}
```

### src/pages/Input/demos/field.tsx

```tsx
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

/** The border turns destructive on its own: the field marks the control, the input reads it. */
export default function InField() {
	return (
		<Field.Root
			className="w-full max-w-sm"
			validationMode="onBlur"
			validate={(value) => (String(value).length >= 3 ? null : 'at least three characters')}
		>
			<Field.Label>display name</Field.Label>
			<Input defaultValue="ab" />
			<Field.Description>this is what other people see.</Field.Description>
			<Field.Error />
		</Field.Root>
	);
}
```

### src/pages/Input/demos/icon.tsx

```tsx
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

/**
 * An icon in a field is a composition, not a slot: the input keeps its own box, the glyph is
 * placed against it, and the padding on the input is the room the glyph takes.
 */
export default function Icon() {
	return (
		<div className="relative w-full max-w-sm">
			<Search
				aria-hidden
				className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
			/>
			<Input
				type="search"
				placeholder="search components"
				aria-label="search"
				className="pl-9"
			/>
		</div>
	);
}
```

### src/pages/Input/demos/sizes.tsx

```tsx
import { Input } from '@/components/ui/input';

export default function Sizes() {
	return (
		<div className="flex w-full max-w-sm flex-col gap-2">
			<Input size="sm" placeholder="sm · 32 tall" aria-label="sm" />
			<Input size="md" placeholder="md · 36 tall" aria-label="md" />
			<Input size="lg" placeholder="lg · 40 tall" aria-label="lg" />
		</div>
	);
}
```

### src/pages/Input/demos/states.tsx

```tsx
import { Input } from '@/components/ui/input';

export default function States() {
	return (
		<div className="flex w-full max-w-sm flex-col gap-2">
			<Input defaultValue="a value" aria-label="filled" />
			<Input readOnly defaultValue="read only" aria-label="read only" />
			<Input disabled placeholder="disabled" aria-label="disabled" />
			<Input aria-invalid defaultValue="not an address" aria-label="invalid" />
		</div>
	);
}
```
