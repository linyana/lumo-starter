# checkbox

> One of several, any number of them: a 16px box, the tick inside it, and a real hidden input so a form and a label both see a checkbox. Indeterminate draws a dash in place of the tick.

## install

```bash
bunx shadcn@latest add @lumo/checkbox
```

- payload: `/r/checkbox.json`
- docs page: `/checkbox`
- comes with it: `@lumo/utils`, `@lumo/control`
- npm packages: `@base-ui/react`, `lucide-react`
- lands in: `checkbox.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/checkbox.tsx

```tsx
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { Check, Minus } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { toggleBox, toggleMark } from '@/lib/control';

export type RootProps = Omit<ComponentProps<typeof BaseCheckbox.Root>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** A 16px box that carries its own hidden input, so a form and a label both see a checkbox. */
export function Root({ className, ...props }: RootProps) {
	return (
		<BaseCheckbox.Root
			data-slot="checkbox"
			className={cn(
				toggleBox,
				// A checkbox fills when it is checked, and the tick is the surface's own colour.
				'rounded-sm text-primary-foreground',
				'data-checked:bg-primary',
				'data-indeterminate:border-primary data-indeterminate:bg-primary',
				className,
			)}
			{...props}
		/>
	);
}

export type IndicatorProps = Omit<
	ComponentProps<typeof BaseCheckbox.Indicator>,
	'className' | 'children'
> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
	/** Replaces the tick. The indeterminate dash is drawn for you, so this is for another tick. */
	children?: ReactNode;
};

/**
 * The tick. Mounted only while the box holds a value: Base UI takes it out of the DOM otherwise,
 * which is why the glyph does not need a hidden state of its own.
 */
export function Indicator({ className, children, ...props }: IndicatorProps) {
	return (
		<BaseCheckbox.Indicator
			data-slot="checkbox-indicator"
			className={cn(
				'group/indicator flex items-center justify-center',
				toggleMark,
				'data-starting-style:scale-75 data-ending-style:scale-75',
				'[&_svg]:size-3',
				className,
			)}
			{...props}
		>
			{children ?? (
				<>
					<Check aria-hidden className="group-data-indeterminate/indicator:hidden" />
					<Minus
						aria-hidden
						className="hidden group-data-indeterminate/indicator:block"
					/>
				</>
			)}
		</BaseCheckbox.Indicator>
	);
}

/** A box, and the tick that says it is ticked — or the dash that says only some of it is. */
export const Checkbox = { Root, Indicator };
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Checkbox/demos/basic.tsx

```tsx
import { Checkbox } from '@/components/ui/checkbox';
import { Field } from '@/components/ui/field';

export default function Basic() {
	return (
		<div className="flex w-full max-w-sm flex-col gap-3">
			<Field.Root>
				<Field.Item>
					<Checkbox.Root name="readme" defaultChecked>
						<Checkbox.Indicator />
					</Checkbox.Root>
					<div className="space-y-0.5">
						<Field.Label>readme</Field.Label>
						<Field.Description>who this is for, and how to start.</Field.Description>
					</div>
				</Field.Item>
			</Field.Root>
			<Field.Root>
				<Field.Item>
					<Checkbox.Root name="license">
						<Checkbox.Indicator />
					</Checkbox.Root>
					<div className="space-y-0.5">
						<Field.Label>license</Field.Label>
						<Field.Description>
							a file nobody reads and everybody checks for.
						</Field.Description>
					</div>
				</Field.Item>
			</Field.Root>
			<Field.Root disabled>
				<Field.Item>
					<Checkbox.Root name="changelog" defaultChecked>
						<Checkbox.Indicator />
					</Checkbox.Root>
					<Field.Label>changelog</Field.Label>
				</Field.Item>
			</Field.Root>
		</div>
	);
}
```

### src/pages/Checkbox/demos/field.tsx

```tsx
import { Checkbox } from '@/components/ui/checkbox';
import { Field } from '@/components/ui/field';

/** `required` on the checkbox is a native constraint, so a field above it reports it and the box
 *  carries the same destructive border an invalid input does. */
export default function InField() {
	return (
		<Field.Root className="w-full max-w-sm" validationMode="onBlur">
			<Field.Item>
				<Checkbox.Root name="confirm" required>
					<Checkbox.Indicator />
				</Checkbox.Root>
				<div className="space-y-0.5">
					<Field.Label>delete the archive</Field.Label>
					<Field.Description>every build in it goes with it.</Field.Description>
				</div>
			</Field.Item>
			<Field.Error match="valueMissing">tick it to go on.</Field.Error>
		</Field.Root>
	);
}
```

### src/pages/Checkbox/demos/states.tsx

```tsx
import { Checkbox } from '@/components/ui/checkbox';
import { Field } from '@/components/ui/field';

export default function States() {
	return (
		<div className="flex w-full max-w-sm flex-col gap-3">
			<Field.Root>
				<Field.Item>
					<Checkbox.Root name="off">
						<Checkbox.Indicator />
					</Checkbox.Root>
					<Field.Label>unticked</Field.Label>
				</Field.Item>
			</Field.Root>
			<Field.Root>
				<Field.Item>
					<Checkbox.Root name="on" defaultChecked>
						<Checkbox.Indicator />
					</Checkbox.Root>
					<Field.Label>ticked</Field.Label>
				</Field.Item>
			</Field.Root>
			<Field.Root>
				<Field.Item>
					<Checkbox.Root name="some" indeterminate>
						<Checkbox.Indicator />
					</Checkbox.Root>
					<Field.Label>neither — some of them</Field.Label>
				</Field.Item>
			</Field.Root>
			<Field.Root>
				<Field.Item>
					<Checkbox.Root name="readonly" defaultChecked readOnly>
						<Checkbox.Indicator />
					</Checkbox.Root>
					<Field.Label>read only</Field.Label>
				</Field.Item>
			</Field.Root>
			<Field.Root disabled>
				<Field.Item>
					<Checkbox.Root name="disabled">
						<Checkbox.Indicator />
					</Checkbox.Root>
					<Field.Label>disabled</Field.Label>
				</Field.Item>
			</Field.Root>
		</div>
	);
}
```
