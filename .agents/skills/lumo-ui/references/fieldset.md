# fieldset

> A heading over the fields it names, so a long form reads as several answers instead of one list. A native `<fieldset>` with its frame taken off — the legend is the group's accessible name, and a group that is disabled dims as one.

## install

```bash
bunx shadcn@latest add @lumo/fieldset
```

- payload: `/r/fieldset.json`
- docs page: `/fieldset`
- comes with it: `@lumo/utils`
- npm packages: `@base-ui/react`
- lands in: `fieldset.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/fieldset.tsx

```tsx
import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type RootProps = Omit<ComponentProps<typeof BaseFieldset.Root>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * A native `<fieldset>` with its frame taken off. The legend is what names the group to a reader and
 * to a screen reader alike, so a box drawn around the fields would only repeat it — and the zeroed
 * margin, padding and border undo the browser's own, which would otherwise wrap every group in it.
 * `min-w-0` is the same undo for the `min-inline-size: min-content` that makes a fieldset refuse to
 * shrink inside a flex column.
 */
export function Root({ className, ...props }: RootProps) {
	return (
		<BaseFieldset.Root
			data-slot="fieldset"
			className={cn('m-0 flex min-w-0 flex-col gap-4 border-0 p-0', className)}
			{...props}
		/>
	);
}

export type LegendProps = Omit<ComponentProps<typeof BaseFieldset.Legend>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The name of the group. It is louder than a `Field.Label`, because it is a heading over several of
 * them rather than the name of one control — and a group that is disabled dims as one.
 */
export function Legend({ className, ...props }: LegendProps) {
	return (
		<BaseFieldset.Legend
			data-slot="fieldset-legend"
			className={cn('text-base font-semibold data-disabled:opacity-50', className)}
			{...props}
		/>
	);
}

/** A heading, and the fields it names — one answer among the several a long form asks for. */
export const Fieldset = { Root, Legend };
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Fieldset/demos/basic.tsx

```tsx
import { Field } from '@/components/ui/field';
import { Fieldset } from '@/components/ui/fieldset';
import { Input } from '@/components/ui/input';

/** A legend and the fields under it; the grouping is the heading, not a frame. */
export default function Basic() {
	return (
		<Fieldset.Root className="w-full max-w-sm">
			<Fieldset.Legend>billing details</Fieldset.Legend>

			<Field.Root name="company">
				<Field.Label>company</Field.Label>
				<Input placeholder="Lumo" />
			</Field.Root>

			<Field.Root name="taxId">
				<Field.Label>tax id</Field.Label>
				<Input placeholder="FR 40 123456789" />
				<Field.Description>left empty for a personal account.</Field.Description>
			</Field.Root>
		</Fieldset.Root>
	);
}
```

### src/pages/Fieldset/demos/groups.tsx

```tsx
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Fieldset } from '@/components/ui/fieldset';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

/**
 * Two answers in one form: each legend is announced before the fields under it, so a reader hearing
 * "city" also hears which city. The fields keep their own names — a group is a heading, not a prefix.
 */
export default function Groups() {
	return (
		<Form className="w-full max-w-sm">
			<Fieldset.Root>
				<Fieldset.Legend>where it goes</Fieldset.Legend>

				<Field.Root name="recipient">
					<Field.Label>recipient</Field.Label>
					<Input required placeholder="Ada Lovelace" />
					<Field.Error match="valueMissing">a recipient is required.</Field.Error>
				</Field.Root>

				<Field.Root name="city">
					<Field.Label>city</Field.Label>
					<Input required placeholder="London" />
					<Field.Error match="valueMissing">a city is required.</Field.Error>
				</Field.Root>
			</Fieldset.Root>

			<Fieldset.Root>
				<Fieldset.Legend>who pays</Fieldset.Legend>

				<Field.Root name="card">
					<Field.Label>card number</Field.Label>
					<Input
						required
						inputMode="numeric"
						autoComplete="cc-number"
						placeholder="4242 4242 4242 4242"
					/>
					<Field.Error match="valueMissing">a card number is required.</Field.Error>
				</Field.Root>
			</Fieldset.Root>

			<Button type="submit" className="self-start">
				order
			</Button>
		</Form>
	);
}
```
