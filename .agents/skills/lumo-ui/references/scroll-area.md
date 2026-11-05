# scroll-area

> A pane that scrolls under the platform's overlay bar: instead of the box's own, a track drawn over the content that stays out of sight until the pane is scrolled or pointed at. Behaviour from Base UI, appearance from tokens.

## install

```bash
bunx shadcn@latest add @lumo/scroll-area
```

- payload: `/r/scroll-area.json`
- docs page: `/scroll-area`
- comes with it: `@lumo/utils`
- npm packages: `@base-ui/react`
- lands in: `scroll-area.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/scroll-area.tsx

```tsx
import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type RootProps = ComponentProps<typeof BaseScrollArea.Root>;
export type ViewportProps = ComponentProps<typeof BaseScrollArea.Viewport>;
export type ContentProps = ComponentProps<typeof BaseScrollArea.Content>;
export type ScrollbarProps = ComponentProps<typeof BaseScrollArea.Scrollbar>;
export type ThumbProps = ComponentProps<typeof BaseScrollArea.Thumb>;
export type CornerProps = ComponentProps<typeof BaseScrollArea.Corner>;

/**
 * Sizes the viewport has no say in: it always fills the root, so the area scrolls only once the
 * caller gives the root a height it can run out of.
 */
export function Root({ className, ...props }: RootProps) {
	return (
		<BaseScrollArea.Root
			data-slot="scroll-area-root"
			className={cn('relative min-h-0 overflow-hidden', className)}
			{...props}
		/>
	);
}

export function Viewport({ className, ...props }: ViewportProps) {
	return (
		<BaseScrollArea.Viewport
			data-slot="scroll-area-viewport"
			className={cn('size-full', className)}
			{...props}
		/>
	);
}

export function Content({ className, ...props }: ContentProps) {
	return (
		<BaseScrollArea.Content data-slot="scroll-area-content" className={className} {...props} />
	);
}

/**
 * Drawn over the content, never beside it: Base UI hides the native bar and gives this track its
 * own absolute placement, so the viewport keeps its width whether or not anything overflows. It
 * stays out of sight until the area is scrolled or pointed at — the platform's overlay behaviour,
 * in the theme's colours — and takes no pointer events while hidden. It brings its own thumb, since
 * a track with nothing in it draws nothing.
 */
export function Scrollbar({
	className,
	orientation = 'vertical',
	children,
	...props
}: ScrollbarProps) {
	return (
		<BaseScrollArea.Scrollbar
			data-slot="scroll-area-scrollbar"
			orientation={orientation}
			className={cn(
				'z-10 flex touch-none p-0.5 select-none',
				'opacity-0 transition-opacity duration-(--duration-state) ease-linear',
				'pointer-events-none data-hovering:pointer-events-auto data-scrolling:pointer-events-auto',
				'data-hovering:opacity-100 data-scrolling:opacity-100',
				orientation === 'vertical' ? 'w-2.5 justify-center' : 'h-2.5 flex-col items-center',
				className,
			)}
			{...props}
		>
			{children ?? <Thumb />}
		</BaseScrollArea.Scrollbar>
	);
}

/** Its length comes from Base UI, as a CSS variable it writes on every scroll — never from here. */
export function Thumb({ className, ...props }: ThumbProps) {
	return (
		<BaseScrollArea.Thumb
			data-slot="scroll-area-thumb"
			className={cn(
				'size-full rounded-full bg-ring transition-colors duration-(--duration-state) ease-linear',
				'hover:bg-muted-foreground',
				className,
			)}
			{...props}
		/>
	);
}

export function Corner({ className, ...props }: CornerProps) {
	return (
		<BaseScrollArea.Corner data-slot="scroll-area-corner" className={className} {...props} />
	);
}

export const ScrollArea = { Root, Viewport, Content, Scrollbar, Thumb, Corner };
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/ScrollArea/demos/basic.tsx

```tsx
import { ScrollArea } from '@/components/ui/scroll-area';

const paragraphs = [
	'A pane is scrollable only once it has a height to run out of: the root takes it from its parent, and the viewport fills the root.',
	'The bar is not the box’s own. It is drawn over the content on the inline end, which is why the pane never changes width when the content starts to overflow.',
	'It stays out of sight until it is needed — until the pane is scrolled, or the pointer comes to rest over it — and by then the thumb is where the position is.',
	'Dragging it works, and so does clicking the track: those are the parts worth keeping from a native bar.',
];

export default function Basic() {
	return (
		<div className="w-full max-w-md rounded-lg border bg-muted/40">
			<ScrollArea.Root className="h-56">
				<ScrollArea.Viewport>
					<ScrollArea.Content className="flex flex-col gap-3 p-4 text-sm leading-relaxed">
						{paragraphs.map((paragraph) => (
							<p key={paragraph.slice(0, 24)}>{paragraph}</p>
						))}
					</ScrollArea.Content>
				</ScrollArea.Viewport>
				<ScrollArea.Scrollbar />
			</ScrollArea.Root>
		</div>
	);
}
```

### src/pages/ScrollArea/demos/both.tsx

```tsx
import { ScrollArea } from '@/components/ui/scroll-area';

const months = [
	'january',
	'february',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december',
];

export default function Both() {
	return (
		<div className="w-full max-w-md rounded-lg border bg-muted/40">
			<ScrollArea.Root className="h-48">
				<ScrollArea.Viewport>
					<ScrollArea.Content className="grid grid-cols-[repeat(2,max-content)] gap-2 p-4 text-sm">
						{months.flatMap((month) => [
							<code key={`${month}-a`} className="px-10">
								{month}
							</code>,
							<code key={`${month}-b`} className="px-10 text-muted-foreground">
								{`${month}.log`}
							</code>,
						])}
					</ScrollArea.Content>
				</ScrollArea.Viewport>
				<ScrollArea.Scrollbar orientation="vertical" />
				<ScrollArea.Scrollbar orientation="horizontal" />
				<ScrollArea.Corner />
			</ScrollArea.Root>
		</div>
	);
}
```
