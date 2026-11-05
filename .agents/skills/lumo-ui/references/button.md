# button

> The reference component: tailwind-variants API, token-driven appearance, data-slot / data-variant hooks.

## install

```bash
bunx shadcn@latest add @lumo/button
```

- payload: `/r/button.json`
- docs page: `/button`
- comes with it: `@lumo/utils`, `@lumo/spinner`, `@lumo/control`
- npm packages: `@base-ui/react`, `tailwind-variants`
- lands in: `button.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/button.tsx

```tsx
import { Button as BaseButton } from '@base-ui/react/button';
import type { ComponentProps, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { iconSlot, stateLayer } from '@/lib/control';

/** Reference component — other components follow this shape. */
export const buttonVariants = tv({
	base: [
		'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
		'relative rounded-md font-medium select-none',
		'transition-[color,background-color,border-color,translate]',
		'ease-(--ease-spring) duration-(--duration-state)',
		'active:not-aria-[haspopup]:translate-y-(--press-offset)',
		'active:not-aria-[haspopup]:duration-(--duration-press)',
		stateLayer,
		'data-pressed:after:opacity-(--state-layer-hover-opacity)',
		'data-disabled:pointer-events-none',
		'data-disabled:not-data-loading:opacity-50',
		iconSlot,
		'cursor-pointer',
	],
	variants: {
		variant: {
			default: 'bg-primary text-primary-foreground',
			secondary: 'bg-secondary text-secondary-foreground',
			outline: 'border bg-background',
			ghost: 'bg-transparent',
			destructive: 'bg-destructive text-destructive-foreground',
			link: 'text-primary underline-offset-4 hover:underline after:hidden',
		},
		size: {
			sm: 'h-8 gap-1.5 px-3 text-sm',
			md: 'h-9 px-4 text-sm',
			lg: 'h-10 px-6 text-base',
			icon: 'size-9 text-sm',
		},
	},
	compoundVariants: [
		{
			variant: ['default', 'destructive'],
			class: [
				'[--state-layer-hover-opacity:var(--state-layer-fill-hover-opacity)]',
				'[--state-layer-pressed-opacity:var(--state-layer-fill-pressed-opacity)]',
			],
		},
	],
	defaultVariants: {
		variant: 'default',
		size: 'md',
	},
});

export type ButtonProps = Omit<ComponentProps<typeof BaseButton>, 'className'> &
	VariantProps<typeof buttonVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
		/** Leading graphic. While `loading` the spinner takes this slot. */
		icon?: ReactNode;
		/** Custom spinner, defaults to the built-in one. */
		loadingIcon?: ReactNode;
		loading?: boolean;
	};

export function Button({
	className,
	variant = 'default',
	size = 'md',
	icon = null,
	loadingIcon,
	loading = false,
	disabled = false,
	children,
	...props
}: ButtonProps) {
	const spinner = loadingIcon ?? <Spinner label={null} />;

	return (
		<BaseButton
			data-slot="button"
			data-variant={variant}
			data-size={size}
			data-loading={loading ? '' : undefined}
			aria-busy={loading || undefined}
			disabled={disabled || loading}
			focusableWhenDisabled={loading || undefined}
			className={cn(buttonVariants({ variant, size }), className)}
			{...props}
		>
			{icon ? (
				<>
					{loading ? spinner : icon}
					{children}
				</>
			) : (
				<span data-slot="button-content" className="grid">
					<span className={cn('col-start-1 row-start-1', loading && 'opacity-0')}>
						{children}
					</span>
					{loading && (
						<span className="col-start-1 row-start-1 flex place-self-center">
							{spinner}
						</span>
					)}
				</span>
			)}
		</BaseButton>
	);
}
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Button/demos/basic.tsx

```tsx
import { Button } from '@/components/ui/button';

export default function Basic() {
	return <Button>save changes</Button>;
}
```

### src/pages/Button/demos/composition.tsx

```tsx
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

export default function Composition() {
	return (
		<Dialog.Root>
			<Dialog.Trigger render={<Button variant="outline">open dialog</Button>} />
			<Dialog.Portal>
				<Dialog.Backdrop />
				<Dialog.Viewport>
					<Dialog.Popup>
						<Dialog.Title>drawn by a button</Dialog.Title>
						<Dialog.Description>
							the trigger is a lumo button, passed through render.
						</Dialog.Description>
						<div className="mt-6 flex justify-end gap-2">
							<Dialog.Close render={<Button variant="ghost">cancel</Button>} />
							<Dialog.Close render={<Button>confirm</Button>} />
						</div>
					</Dialog.Popup>
				</Dialog.Viewport>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
```

### src/pages/Button/demos/icon.tsx

```tsx
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Icon() {
	return (
		<>
			<Button icon={<Plus />}>add</Button>
			<Button variant="outline" icon={<Pencil />}>
				edit
			</Button>
			<Button variant="outline" icon={<Trash2 />}>
				delete
			</Button>
			<Button variant="ghost" size="icon" aria-label="search">
				<Search />
			</Button>
		</>
	);
}
```

### src/pages/Button/demos/sizes.tsx

```tsx
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Sizes() {
	return (
		<>
			<Button size="sm">sm</Button>
			<Button size="md">md</Button>
			<Button size="lg">lg</Button>
			<Button size="icon" aria-label="add">
				<Plus />
			</Button>
		</>
	);
}
```

### src/pages/Button/demos/states.tsx

```tsx
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function States() {
	return (
		<div className="space-y-4">
			<div className="flex flex-wrap justify-center gap-3">
				<Button disabled>disabled</Button>
				<Button variant="outline" disabled>
					disabled outline
				</Button>
				<Button variant="ghost" disabled>
					disabled ghost
				</Button>
			</div>
			<div className="flex flex-wrap justify-center gap-3">
				<Button loading>loading</Button>
				<Button variant="outline" icon={<Plus />} loading>
					add
				</Button>
				<Button size="icon" loading aria-label="saving">
					<Plus />
				</Button>
			</div>
		</div>
	);
}
```

### src/pages/Button/demos/variants.tsx

```tsx
import { Button } from '@/components/ui/button';

const variants = ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const;

export default function Variants() {
	return (
		<>
			{variants.map((variant) => (
				<Button key={variant} variant={variant}>
					{variant}
				</Button>
			))}
		</>
	);
}
```
