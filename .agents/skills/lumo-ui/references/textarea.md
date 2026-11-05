# textarea

> Several lines of text in the same box as an Input. The element is the browser's, mounted through Field.Control, which is what gives it a name, a describedby and the invalid border inside a field.

## install

```bash
bunx shadcn@latest add @lumo/textarea
```

- payload: `/r/textarea.json`
- docs page: `/textarea`
- comes with it: `@lumo/utils`, `@lumo/control`
- npm packages: `@base-ui/react`, `tailwind-variants`
- lands in: `textarea.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/textarea.tsx

```tsx
import { Field } from '@base-ui/react/field';
import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { fieldShell } from '@/lib/control';

export const textareaVariants = tv({
	// `read-only` is the textarea's own: the shell is shared with controls that cannot be typed into,
	// where `:read-only` matches for their whole life.
	base: [fieldShell, 'read-only:bg-muted', 'resize-y'],
	variants: {
		size: {
			sm: 'min-h-16 px-2.5 py-1.5 text-sm',
			md: 'min-h-20 px-3 py-2 text-sm',
			lg: 'min-h-24 px-3.5 py-2.5 text-base',
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

export type TextareaProps = Omit<ComponentProps<'textarea'>, 'className'> &
	VariantProps<typeof textareaVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
	};

/**
 * Several lines of text. The element is the browser's — there is no Base UI textarea — and it is
 * mounted through `Field.Control`, which is what hands it an id, a describedby and the invalid
 * flag when a field is above it. Its `size` is a minimum height; the height itself is `rows`, or
 * the corner the reader drags.
 */
export function Textarea({ className, size = 'md', ...props }: TextareaProps) {
	return (
		<Field.Control
			render={
				<textarea
					data-slot="textarea"
					data-size={size}
					className={cn(textareaVariants({ size }), className)}
					{...props}
				/>
			}
		/>
	);
}
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Textarea/demos/basic.tsx

```tsx
import { Textarea } from '@/components/ui/textarea';

export default function Basic() {
	return (
		<div className="flex w-full max-w-sm flex-col gap-3">
			<Textarea size="sm" placeholder="sm · 64 at least" aria-label="sm" />
			<Textarea size="md" placeholder="md · 80 at least" aria-label="md" />
			<Textarea size="lg" placeholder="lg · 96 at least" aria-label="lg" />
		</div>
	);
}
```

### src/pages/Textarea/demos/field.tsx

```tsx
import { Field } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

export default function InField() {
	return (
		<Field.Root
			className="w-full max-w-sm"
			validationMode="onBlur"
			validate={(value) =>
				String(value).trim().length >= 12 ? null : 'twelve characters is a sentence.'
			}
		>
			<Field.Label>release notes</Field.Label>
			<Textarea rows={4} placeholder="what changed, and what it costs" />
			<Field.Description>
				shown on the deploy page, and in the mail that follows it.
			</Field.Description>
			<Field.Error />
		</Field.Root>
	);
}
```

### src/pages/Textarea/demos/states.tsx

```tsx
import { Textarea } from '@/components/ui/textarea';

export default function States() {
	return (
		<div className="flex w-full max-w-sm flex-col gap-3">
			<Textarea defaultValue="a value" aria-label="filled" />
			<Textarea readOnly defaultValue="read only" aria-label="read only" />
			<Textarea disabled placeholder="disabled" aria-label="disabled" />
			<Textarea aria-invalid defaultValue="not an address" aria-label="invalid" />
			<Textarea
				rows={6}
				className="resize-none"
				placeholder="six rows, and no corner to drag"
				aria-label="fixed height"
			/>
		</div>
	);
}
```
