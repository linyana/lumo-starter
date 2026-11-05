# radio-group

> Exactly one of these, and never none: Base UI's group and its radio as one namespace, so the value, the arrow keys and the dot between them arrive together.

## install

```bash
bunx shadcn@latest add @lumo/radio-group
```

- payload: `/r/radio-group.json`
- docs page: `/radio-group`
- comes with it: `@lumo/utils`, `@lumo/control`
- npm packages: `@base-ui/react`
- lands in: `radio-group.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/radio-group.tsx

```tsx
import { Radio, type RadioRootProps } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup, type RadioGroupProps } from '@base-ui/react/radio-group';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { toggleBox, toggleMark } from '@/lib/control';

export type RootProps<Value = unknown> = Omit<RadioGroupProps<Value>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** The group: one value for all of the items inside it, and the arrow keys between them. */
export function Root<Value>({ className, ...props }: RootProps<Value>) {
	return (
		<BaseRadioGroup
			data-slot="radio-group"
			className={cn('grid gap-2', className)}
			{...props}
		/>
	);
}

export type ItemProps<Value = unknown> = Omit<RadioRootProps<Value>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** One option. Base UI's `Radio`, named for what it is within the group rather than on its own. */
export function Item<Value>({ className, ...props }: ItemProps<Value>) {
	return (
		<Radio.Root
			data-slot="radio"
			// A radio keeps its ring and puts a dot in it, so only the box is the checkbox's.
			className={cn(toggleBox, 'rounded-full', className)}
			{...props}
		/>
	);
}

export type IndicatorProps = Omit<ComponentProps<typeof Radio.Indicator>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** The dot. Mounted only for the item that holds the group's value. */
export function Indicator({ className, ...props }: IndicatorProps) {
	return (
		<Radio.Indicator
			data-slot="radio-indicator"
			className={cn(
				'size-2 rounded-full bg-primary',
				toggleMark,
				'data-starting-style:scale-50 data-ending-style:scale-50',
				className,
			)}
			{...props}
		/>
	);
}

/** Exactly one of these. Give the group a name with `Field`, and each item one with `Field.Item`. */
export const RadioGroup = { Root, Item, Indicator };
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/RadioGroup/demos/basic.tsx

```tsx
import { Field } from '@/components/ui/field';
import { RadioGroup } from '@/components/ui/radio-group';

const plans = [
	{ value: 'solo', label: 'solo', description: 'one seat, one workspace.' },
	{ value: 'team', label: 'team', description: 'ten seats and the projects they share.' },
	{ value: 'studio', label: 'studio', description: 'as many seats as you like, and an invoice.' },
];

export default function Basic() {
	return (
		<Field.Root className="w-full max-w-sm">
			<Field.Label>plan</Field.Label>
			<RadioGroup.Root defaultValue="team" className="gap-3">
				{plans.map(({ value, label, description }) => (
					<Field.Item key={value}>
						<RadioGroup.Item value={value} className="mt-0.5">
							<RadioGroup.Indicator />
						</RadioGroup.Item>
						<div className="space-y-0.5">
							<Field.Label>{label}</Field.Label>
							<Field.Description>{description}</Field.Description>
						</div>
					</Field.Item>
				))}
			</RadioGroup.Root>
		</Field.Root>
	);
}
```

### src/pages/RadioGroup/demos/controlled.tsx

```tsx
import { useState } from 'react';
import { Field } from '@/components/ui/field';
import { RadioGroup } from '@/components/ui/radio-group';

const densities = ['comfortable', 'compact'];

export default function Controlled() {
	const [density, setDensity] = useState('comfortable');

	return (
		<Field.Root className="w-full max-w-sm">
			<Field.Label>density</Field.Label>
			<RadioGroup.Root
				value={density}
				onValueChange={setDensity}
				className="grid-flow-col justify-start gap-4"
			>
				{densities.map((option) => (
					<Field.Item key={option} className="items-center gap-2">
						<RadioGroup.Item value={option}>
							<RadioGroup.Indicator />
						</RadioGroup.Item>
						<Field.Label>{option}</Field.Label>
					</Field.Item>
				))}
			</RadioGroup.Root>
			<p className="text-sm text-muted-foreground">
				the list is drawn <span className="font-medium text-foreground">{density}</span>.
			</p>
		</Field.Root>
	);
}
```

### src/pages/RadioGroup/demos/states.tsx

```tsx
import { Field } from '@/components/ui/field';
import { RadioGroup } from '@/components/ui/radio-group';

/** The group is a grid by default; a single row is a call site's `grid-flow-col`. */
export default function States() {
	return (
		<div className="flex w-full max-w-sm flex-col gap-6">
			<Field.Root>
				<Field.Label>billing</Field.Label>
				<RadioGroup.Root
					defaultValue="monthly"
					className="grid-flow-col justify-start gap-4"
				>
					{['monthly', 'yearly'].map((period) => (
						<Field.Item key={period} className="items-center gap-2">
							<RadioGroup.Item value={period}>
								<RadioGroup.Indicator />
							</RadioGroup.Item>
							<Field.Label>{period}</Field.Label>
						</Field.Item>
					))}
				</RadioGroup.Root>
			</Field.Root>

			<Field.Root>
				<Field.Label>region</Field.Label>
				<RadioGroup.Root defaultValue="eu" className="gap-2">
					<Field.Item className="items-center gap-2">
						<RadioGroup.Item value="eu">
							<RadioGroup.Indicator />
						</RadioGroup.Item>
						<Field.Label>eu-west</Field.Label>
					</Field.Item>
					<Field.Item className="items-center gap-2" disabled>
						<RadioGroup.Item value="us">
							<RadioGroup.Indicator />
						</RadioGroup.Item>
						<Field.Label>us-east</Field.Label>
					</Field.Item>
				</RadioGroup.Root>
				<Field.Description>a region you have shipped to cannot be left.</Field.Description>
			</Field.Root>
		</div>
	);
}
```
