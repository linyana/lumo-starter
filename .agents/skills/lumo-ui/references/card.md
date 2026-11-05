# card

> One surface for one subject: a header with its title, description and action, a body that takes the slack, and a footer. Two sizes, set once on the root and read by every part, and a `hoverable` root for a card that is a target.

## install

```bash
bunx shadcn@latest add @lumo/card
```

- payload: `/r/card.json`
- docs page: `/card`
- comes with it: `@lumo/utils`
- npm packages: `tailwind-variants`
- lands in: `card.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/card.tsx

```tsx
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { tv, type VariantProps } from 'tailwind-variants';

export type ActionProps = ComponentProps<'div'>;

/** The slot in the corner of a header — one button, one menu trigger, nothing tall. */
export function Action({ className, ...props }: ActionProps) {
	return (
		<div
			data-slot="card-action"
			className={cn(
				'col-start-2 row-start-1 self-center justify-self-end',
				'group-has-data-[slot=card-description]/card-header:row-span-2',
				'group-has-data-[slot=card-description]/card-header:self-start',
				className,
			)}
			{...props}
		/>
	);
}

export type ContentProps = ComponentProps<'div'>;

export function Content({ className, ...props }: ContentProps) {
	return (
		<div
			data-slot="card-content"
			// Grows into the slack of a stretched card, which keeps a footer on the bottom edge
			// when cards of different heights share a row.
			className={cn('flex-1 px-(--card-pad)', className)}
			{...props}
		/>
	);
}

export type DescriptionProps = ComponentProps<'div'>;

export function Description({ className, ...props }: DescriptionProps) {
	return (
		<div
			data-slot="card-description"
			className={cn('text-sm text-muted-foreground', className)}
			{...props}
		/>
	);
}

export type FooterProps = ComponentProps<'div'>;

export function Footer({ className, ...props }: FooterProps) {
	return (
		<div
			data-slot="card-footer"
			className={cn('flex items-center gap-2 px-(--card-pad)', className)}
			{...props}
		/>
	);
}

export type HeaderProps = ComponentProps<'div'>;

export function Header({ className, ...props }: HeaderProps) {
	return (
		<div
			data-slot="card-header"
			// Two columns only when an action is present, so a title and its description stay in
			// one column and the action sits opposite both of them.
			className={cn(
				'group/card-header grid auto-rows-min items-center gap-1.5 px-(--card-pad) py-1',
				'has-data-[slot=card-action]:grid-cols-[1fr_auto]',
				'has-data-[slot=card-description]:grid-rows-[auto_auto]',
				'has-data-[slot=card-description]:items-start',
				className,
			)}
			{...props}
		/>
	);
}

export const cardVariants = tv({
	base: [
		'group/card flex flex-col',
		'rounded-xl bg-card text-card-foreground shadow-surface',
		// The inline inset every part is drawn at. A variable rather than a class per part, so a
		// header, a body and a footer cannot drift apart, and a part added later is inset too
		// without being told to be.
		'[--card-pad:--spacing(6)]',
	],
	variants: {
		bordered: {
			true: 'border border-border',
		},
		size: {
			sm: 'gap-4 py-4 [--card-pad:--spacing(4)]',
			md: 'gap-6 py-6',
		},
		hoverable: {
			true: [
				// Keep the surface's hairline while adding the hover halo. The cursor is the
				// consumer's: a card is a div, not the link inside it.
				'transition-shadow duration-(--duration-state)',
				'hover:shadow-[var(--shadow-surface),var(--shadow-lifted)]',
			],
		},
	},
	defaultVariants: {
		bordered: false,
		size: 'md',
		hoverable: false,
	},
});

export type CardSize = NonNullable<VariantProps<typeof cardVariants>['size']>;

export type RootProps = ComponentProps<'div'> & VariantProps<typeof cardVariants>;

/**
 * The surface itself. Its size cascades to the parts: the inset travels as `--card-pad`, and
 * `data-size` is on the DOM for whatever wants to target it from CSS.
 *
 * `hoverable` is the one prop that changes how the card behaves, and it only changes how it looks:
 * the surface owns the hover, so a click target placed anywhere inside it lights the whole tile.
 * A card is a plain div, so a card that is clicked is still the consumer's to build — the prop says
 * "this one is a target", not "this one is a button".
 */
export function Root({
	className,
	size = 'md',
	bordered = false,
	hoverable = false,
	...props
}: RootProps) {
	return (
		<div
			data-slot="card"
			data-size={size}
			data-bordered={bordered ? '' : undefined}
			data-hoverable={hoverable ? '' : undefined}
			className={cn(cardVariants({ size, bordered, hoverable }), className)}
			{...props}
		/>
	);
}

export type TitleProps = ComponentProps<'div'>;

/**
 * A `div`, not a heading: the level that is right for a card depends on the page around it, and
 * a card cannot know it. Put an `h2`–`h6` inside when the outline matters.
 */
export function Title({ className, ...props }: TitleProps) {
	return (
		<div
			data-slot="card-title"
			className={cn('text-base font-semibold', className)}
			{...props}
		/>
	);
}

/** A surface that groups one thing. Every part is a plain element; the card adds the look. */
export const Card = {
	Root,
	Header,
	Title,
	Description,
	Action,
	Content,
	Footer,
};
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Card/demos/basic.tsx

```tsx
import { CalendarClock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Basic() {
	return (
		<Card.Root className="w-full max-w-sm">
			<Card.Header>
				<Card.Title>scheduled reports</Card.Title>
				<Card.Description>weekly snapshots, no manual exports.</Card.Description>
				<Card.Action>
					<Button variant="ghost" size="sm">
						edit
					</Button>
				</Card.Action>
			</Card.Header>
			<Card.Content className="text-sm text-muted-foreground">
				<div className="flex items-center gap-2">
					<CalendarClock className="size-4 shrink-0" />
					<span>every monday at 09:00 · 4 recipients</span>
				</div>
			</Card.Content>
			<Card.Footer className="justify-end">
				<Button variant="outline" size="sm">
					preview
				</Button>
				<Button size="sm" icon={<Plus />}>
					new report
				</Button>
			</Card.Footer>
		</Card.Root>
	);
}
```

### src/pages/Card/demos/flush.tsx

```tsx
import { Card } from '@/components/ui/card';

export default function Flush() {
	return (
		<Card.Root className="w-full max-w-sm py-0">
			<Card.Content className="px-0 pt-6">
				<div className="h-24 rounded-t-[inherit] bg-muted" />
			</Card.Content>
			<Card.Content className="text-sm">
				an image sits flush against the card's top corners.
			</Card.Content>
			<Card.Footer className="border-t pt-4 pb-4 text-xs text-muted-foreground">
				footer with a divider
			</Card.Footer>
		</Card.Root>
	);
}
```

### src/pages/Card/demos/hoverable.tsx

```tsx
import { Card } from '@/components/ui/card';

const tiles = [
	{ title: 'usage', note: 'this month', value: '1,284' },
	{ title: 'storage', note: 'of 10 gb', value: '3.6 gb' },
];

export default function Hoverable() {
	return (
		<>
			{tiles.map(({ title, note, value }) => (
				<Card.Root key={title} hoverable className="w-56">
					<Card.Header>
						<Card.Title>{title}</Card.Title>
						<Card.Description>{note}</Card.Description>
					</Card.Header>
					<Card.Content className="text-2xl font-semibold">{value}</Card.Content>
				</Card.Root>
			))}
		</>
	);
}
```

### src/pages/Card/demos/sizes.tsx

```tsx
import { Card } from '@/components/ui/card';

const stats = [
	{ title: 'drafts', note: 'unsent replies', value: '12' },
	{ title: 'queued', note: 'waiting on the queue', value: '3' },
];

export default function Sizes() {
	return (
		<>
			{stats.map(({ title, note, value }) => (
				<Card.Root key={title} size="sm" className="w-56">
					<Card.Header>
						<Card.Title>{title}</Card.Title>
						<Card.Description>{note}</Card.Description>
					</Card.Header>
					<Card.Content className="text-2xl font-semibold">{value}</Card.Content>
				</Card.Root>
			))}
		</>
	);
}
```

### src/pages/Card/demos/stretch.tsx

```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Stretch() {
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
					<Button variant="outline" size="sm">
						rotate
					</Button>
				</Card.Footer>
			</Card.Root>
			<Card.Root className="flex-1">
				<Card.Header>
					<Card.Title>webhooks</Card.Title>
					<Card.Description>
						one endpoint, retried three times before it is dropped.
					</Card.Description>
				</Card.Header>
				<Card.Content className="text-sm text-muted-foreground">
					last delivery: 4 minutes ago, 200 ok
				</Card.Content>
				<Card.Footer className="justify-end">
					<Button variant="outline" size="sm">
						edit
					</Button>
				</Card.Footer>
			</Card.Root>
		</div>
	);
}
```
