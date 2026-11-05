# accordion

> A list of folds that share one value: one answer open at a time, or several. Each row is exactly a collapsible — the same caret, the same fold, the same spring — with the open state moved up to the list, and a hairline drawn between two rows rather than around them.

## install

```bash
bunx shadcn@latest add @lumo/accordion
```

- payload: `/r/accordion.json`
- docs page: `/accordion`
- comes with it: `@lumo/utils`, `@lumo/control`, `@lumo/transition`
- npm packages: `@base-ui/react`, `lucide-react`
- lands in: `accordion.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/accordion.tsx

```tsx
import { Accordion as BaseAccordion, type AccordionRootProps } from '@base-ui/react/accordion';
import { ChevronRight } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { caret, iconSlot, stateLayer } from '@/lib/control';
import { Transition } from '@/components/ui/transition';

export type RootProps<Value = unknown> = Omit<AccordionRootProps<Value>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * A list of folds that share one value: one of them open at a time, or several with `multiple`. Base
 * UI owns the value, the trigger's `aria-expanded`, and the fact that a fold inside this list is one of
 * a set rather than a panel of its own.
 *
 * The rows are divided rather than framed — a hairline between two of them and none at either end,
 * which is the whole of what the list draws. A row is exactly a collapsible's: an answer folded under
 * the question that asks for it, turning the same caret on the same spring.
 */
export function Root<Value = unknown>({ className, ...props }: RootProps<Value>) {
	return (
		<BaseAccordion.Root
			data-slot="accordion"
			className={cn('w-full divide-y divide-border', className)}
			{...props}
		/>
	);
}

export type ItemProps = Omit<ComponentProps<typeof BaseAccordion.Item>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** One question and its answer. The item is the box the hairline under it belongs to. */
export function Item({ className, ...props }: ItemProps) {
	return (
		<BaseAccordion.Item
			data-slot="accordion-item"
			className={cn('min-w-0', className)}
			{...props}
		/>
	);
}

export type HeaderProps = Omit<ComponentProps<typeof BaseAccordion.Header>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The heading the trigger sits in. Base UI renders an `h3`, which is a guess at where the list sits in
 * the page: `render={<h2 />}` is how a call site says otherwise, so the level stays the page's
 * business rather than the component's.
 */
export function Header({ className, ...props }: HeaderProps) {
	return (
		<BaseAccordion.Header
			data-slot="accordion-header"
			className={cn('flex', className)}
			{...props}
		/>
	);
}

export type TriggerProps = Omit<ComponentProps<typeof BaseAccordion.Trigger>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The row you press. The same appearance as a collapsible's trigger, `group` included, because the
 * caret inside it reads the open state off this element — and a row that opened a panel without saying
 * so in the same way would be a second kind of disclosure in one library.
 */
export function Trigger({ className, ...props }: TriggerProps) {
	return (
		<BaseAccordion.Trigger
			data-slot="accordion-trigger"
			className={cn(
				'group relative flex w-full cursor-pointer items-center justify-between gap-2',
				'rounded-md px-3 py-2 text-left text-sm font-medium select-none',
				stateLayer,
				'data-disabled:pointer-events-none data-disabled:opacity-50',
				iconSlot,
				className,
			)}
			{...props}
		/>
	);
}

/** The caret, turning with the panel. */
export function Icon({ className, ...props }: ComponentProps<typeof ChevronRight>) {
	return (
		<ChevronRight
			data-slot="accordion-icon"
			aria-hidden="true"
			className={cn(caret, className)}
			{...props}
		/>
	);
}

export type PanelProps = Omit<
	ComponentProps<typeof BaseAccordion.Panel>,
	'className' | 'children'
> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
	/**
	 * The height the folded panel keeps, in pixels, so a closed answer can still show a line of
	 * itself. `0` means closed is out of the layout rather than short.
	 */
	peek?: number;
	children?: ReactNode;
};

/**
 * The answer, folded. Its height belongs to `Transition` — the same glide the collapsible uses, so an
 * accordion row and a lone fold open at the same speed.
 *
 * Base UI still measures and owns the panel: its id, the trigger's `aria-controls`, the state
 * attributes. Only `hidden` is taken off it, because a panel that is never in the layout cannot be
 * animated between two heights; `inert` keeps the closed one out of the way and out of the tab order
 * instead.
 */
export function Panel({ className, peek = 0, children, ...props }: PanelProps) {
	return (
		<BaseAccordion.Panel
			keepMounted
			render={({ hidden, ...panelProps }, state) => (
				<div
					{...panelProps}
					data-slot="accordion-panel"
					inert={!state.open}
					className={cn('overflow-clip', className)}
				>
					<Transition height={state.open ? undefined : peek}>{children}</Transition>
				</div>
			)}
			{...props}
		/>
	);
}

/** A list of folds that are one list, and the parts each fold is made of. */
export const Accordion = { Root, Item, Header, Trigger, Icon, Panel };
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Accordion/demos/basic.tsx

```tsx
import { Accordion } from '@/components/ui/accordion';

export default function Basic() {
	return (
		<Accordion.Root defaultValue={['install']} className="w-full max-w-md">
			<Accordion.Item value="install">
				<Accordion.Header>
					<Accordion.Trigger>
						how is it installed
						<Accordion.Icon />
					</Accordion.Trigger>
				</Accordion.Header>
				<Accordion.Panel>
					<p className="px-3 pb-3 text-sm text-muted-foreground">
						one command per component, copied into the project’s own aliases.
					</p>
				</Accordion.Panel>
			</Accordion.Item>
			<Accordion.Item value="theme">
				<Accordion.Header>
					<Accordion.Trigger>
						can I keep my own colours
						<Accordion.Icon />
					</Accordion.Trigger>
				</Accordion.Header>
				<Accordion.Panel>
					<p className="px-3 pb-3 text-sm text-muted-foreground">
						yes — the palette is the only part a project may skip, and its own{' '}
						<code className="font-mono text-xs">--primary</code> is never overwritten.
					</p>
				</Accordion.Panel>
			</Accordion.Item>
			<Accordion.Item value="version">
				<Accordion.Header>
					<Accordion.Trigger>
						which version does it install
						<Accordion.Icon />
					</Accordion.Trigger>
				</Accordion.Header>
				<Accordion.Panel>
					<p className="px-3 pb-3 text-sm text-muted-foreground">
						the latest. no version is ever pinned, here or in the manifest.
					</p>
				</Accordion.Panel>
			</Accordion.Item>
		</Accordion.Root>
	);
}
```

### src/pages/Accordion/demos/multiple.tsx

```tsx
import { Accordion } from '@/components/ui/accordion';

const faq = [
	{
		value: 'motion',
		question: 'does it animate',
		answer: 'the height of every fold is one spring, the same one Transition uses everywhere else.',
	},
	{
		value: 'less',
		question: 'what if I asked for less motion',
		answer: 'the spring becomes linear and one millisecond long, so the fold is simply there.',
	},
	{
		value: 'keys',
		question: 'can I reach it by keyboard',
		answer: 'every row is a button; tab walks them, enter and space open them.',
	},
];

/** `multiple` lets several answers stand open at once — a reference page rather than a set of choices. */
export default function Multiple() {
	return (
		<Accordion.Root multiple defaultValue={['motion', 'keys']} className="w-full max-w-md">
			{faq.map((entry) => (
				<Accordion.Item key={entry.value} value={entry.value}>
					<Accordion.Header>
						<Accordion.Trigger>
							{entry.question}
							<Accordion.Icon />
						</Accordion.Trigger>
					</Accordion.Header>
					<Accordion.Panel>
						<p className="px-3 pb-3 text-sm text-muted-foreground">{entry.answer}</p>
					</Accordion.Panel>
				</Accordion.Item>
			))}
		</Accordion.Root>
	);
}
```

### src/pages/Accordion/demos/peek.tsx

```tsx
import { Accordion } from '@/components/ui/accordion';

const log = [
	'11:02:04  resolve   lumo-ui@latest',
	'11:02:05  install   @base-ui/react, lucide-react',
	'11:02:06  copy      src/components/ui/accordion.tsx',
];

/**
 * A folded panel can keep a height instead of leaving the layout: `peek` is how much of the answer
 * stays visible, so a closed log still shows where it starts. One line of the mono text is 24px.
 */
export default function Peek() {
	return (
		<Accordion.Root className="w-full max-w-md">
			<Accordion.Item value="log">
				<Accordion.Header>
					<Accordion.Trigger>
						what did the install do
						<Accordion.Icon />
					</Accordion.Trigger>
				</Accordion.Header>
				<Accordion.Panel peek={24}>
					<div className="flex flex-col px-3 pb-3 font-mono text-xs leading-6 text-muted-foreground">
						{log.map((line) => (
							<div key={line}>{line}</div>
						))}
					</div>
				</Accordion.Panel>
			</Accordion.Item>
			<Accordion.Item value="undo">
				<Accordion.Header>
					<Accordion.Trigger>
						and how is it undone
						<Accordion.Icon />
					</Accordion.Trigger>
				</Accordion.Header>
				<Accordion.Panel peek={24}>
					<div className="flex flex-col px-3 pb-3 font-mono text-xs leading-6 text-muted-foreground">
						<div>rm src/components/ui/accordion.tsx</div>
						<div>and the line in registry.json that named it.</div>
					</div>
				</Accordion.Panel>
			</Accordion.Item>
		</Accordion.Root>
	);
}
```

### src/pages/Accordion/demos/states.tsx

```tsx
import { Accordion } from '@/components/ui/accordion';

/** A disabled item on a list that still works: its row is dimmed, and its answer cannot be asked for. */
export default function States() {
	return (
		<Accordion.Root defaultValue={['open']} className="w-full max-w-md">
			<Accordion.Item value="open">
				<Accordion.Header>
					<Accordion.Trigger>
						open, and pressable
						<Accordion.Icon />
					</Accordion.Trigger>
				</Accordion.Header>
				<Accordion.Panel>
					<p className="px-3 pb-3 text-sm text-muted-foreground">
						the row answers the pointer and the keyboard, and the answer is here.
					</p>
				</Accordion.Panel>
			</Accordion.Item>
			<Accordion.Item value="closed">
				<Accordion.Header>
					<Accordion.Trigger>
						closed, and pressable
						<Accordion.Icon />
					</Accordion.Trigger>
				</Accordion.Header>
				<Accordion.Panel>
					<p className="px-3 pb-3 text-sm text-muted-foreground">
						pressing it opens it, and the one above closes.
					</p>
				</Accordion.Panel>
			</Accordion.Item>
			<Accordion.Item value="disabled" disabled>
				<Accordion.Header>
					<Accordion.Trigger>
						disabled
						<Accordion.Icon />
					</Accordion.Trigger>
				</Accordion.Header>
				<Accordion.Panel>
					<p className="px-3 pb-3 text-sm text-muted-foreground">
						out of reach, and out of the tab order.
					</p>
				</Accordion.Panel>
			</Accordion.Item>
		</Accordion.Root>
	);
}
```
