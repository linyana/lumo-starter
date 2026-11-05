# tabs

> One panel at a time, chosen from a row of tabs, with a highlight that travels between them — stacked and cross-fading, or all of them side by side on a track that is slid to the selected one. The track and the box under it move on springs, written to the DOM rather than to state, so a tab change does not re-render the panels it is switching between. Behaviour from Base UI, appearance from tokens.

## install

```bash
bunx shadcn@latest add @lumo/tabs
```

- payload: `/r/tabs.json`
- docs page: `/tabs`
- comes with it: `@lumo/utils`, `@lumo/motion`, `@lumo/measure`, `@lumo/transition`, `@lumo/control`
- npm packages: `@base-ui/react`, `tailwind-variants`
- lands in: `tabs.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/tabs.tsx

```tsx
import {
	Children,
	createContext,
	isValidElement,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
	type ComponentProps,
	type ReactNode,
} from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { iconSlot } from '@/lib/control';
import { frameOf, HAIRLINE, scaleOf } from '@/lib/measure';
import {
	interrupt,
	quickSize,
	sizePreset,
	springSize,
	springSlide,
	startGlide,
	useSpring,
	type Run,
} from '@/lib/motion';
import { Transition } from './transition';

export type TabsVariant = 'rounded' | 'pill' | 'square' | 'point';
export type TabsSize = 'sm' | 'md' | 'lg';

/** Whatever a `Tabs.Tab` is held to — the same values Base UI accepts. */
export type TabsValue = ComponentProps<typeof BaseTabs.Tab>['value'];

export type TabsContextValue = {
	variant: TabsVariant;
	size: TabsSize;
};

/** The look, which almost every part reads — and which no tab change can alter. */
export const TabsContext = createContext<TabsContextValue>({
	variant: 'rounded',
	size: 'md',
});

/**
 * The tab on screen. Its own context, and deliberately a small one: a change of tab re-renders
 * whatever reads this and nothing else, so a panel's contents — which the DOM already says are the
 * ones on screen — are not rebuilt every time somebody clicks a tab.
 */
const ActiveContext = createContext<TabsValue | undefined>(undefined);

/** Whether a `Panel` is inside `Panels`, where it is one lane of a track rather than a stack. */
const TrackContext = createContext(false);

/** A lane is named by the value of the panel in it, so a reorder is a move rather than a remount. */
function paneKey(pane: ReactNode, lane: number) {
	return isValidElement<{ value?: TabsValue }>(pane) ? (pane.props.value ?? lane) : lane;
}

/** The variant and size set on `Tabs.Root`, which every part inherits unless it overrides one. */
export function useTabs() {
	return useContext(TabsContext);
}

export const indicatorVariants = tv({
	base: [
		'pointer-events-none absolute top-0 left-0 z-0',
		'h-(--active-tab-height) w-(--active-tab-width)',
		'translate-x-(--active-tab-left) translate-y-(--active-tab-top)',
		'transition-[translate,width,height]',
		'duration-(--duration-overlay) ease-(--ease-overlay)',
	],
	variants: {
		variant: {
			rounded: 'rounded-md bg-card shadow-sm',
			pill: 'rounded-md bg-secondary',
			square: [
				'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary',
				'data-[orientation=vertical]:after:inset-x-auto',
				'data-[orientation=vertical]:after:inset-y-0 data-[orientation=vertical]:after:right-0',
				'data-[orientation=vertical]:after:h-auto data-[orientation=vertical]:after:w-0.5',
			],
			point: [
				'after:absolute after:bottom-1 after:left-1/2 after:size-1.5',
				'after:-translate-x-1/2 after:rounded-full after:bg-primary',
			],
		},
	},
	defaultVariants: {
		variant: 'rounded',
	},
});

export type IndicatorProps = Omit<ComponentProps<typeof BaseTabs.Indicator>, 'className'> &
	VariantProps<typeof indicatorVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
	};

/**
 * The moving highlight. Base UI measures the active tab and hands the result over as CSS
 * variables, so this only draws — and the same element follows the tab in either orientation.
 */
export function Indicator({ className, variant, ...props }: IndicatorProps) {
	const context = useTabs();
	const resolved = variant ?? context.variant;

	return (
		<BaseTabs.Indicator
			data-slot="tabs-indicator"
			data-variant={resolved}
			className={cn(indicatorVariants({ variant: resolved }), className)}
			{...props}
		/>
	);
}

export const listVariants = tv({
	base: [
		'relative flex w-fit items-center',
		'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
	],
	variants: {
		variant: {
			rounded: 'gap-1 rounded-lg bg-muted p-1',
			pill: 'gap-1 rounded-lg bg-card p-1',
			square: [
				'gap-4',
				'shadow-[inset_0_-1px_0_var(--border)]',
				'data-[orientation=vertical]:shadow-[inset_-1px_0_0_var(--border)]',
			],
			point: 'gap-4',
		},
	},
	defaultVariants: {
		variant: 'rounded',
	},
});

export type ListProps = Omit<ComponentProps<typeof BaseTabs.List>, 'className'> &
	VariantProps<typeof listVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
	};

export function List({ className, variant, ...props }: ListProps) {
	const context = useTabs();
	const resolved = variant ?? context.variant;

	return (
		<BaseTabs.List
			data-slot="tabs-list"
			data-variant={resolved}
			className={cn(listVariants({ variant: resolved }), className)}
			{...props}
		/>
	);
}

export type PanelProps = Omit<ComponentProps<typeof BaseTabs.Panel>, 'className'> & {
	/**
	 * Whether the panel's contents sit in a `Transition`, whose box eases to their size. `false`
	 * opts out of the wrapper altogether, which also drops that.
	 */
	transition?: boolean;
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * A panel in a `Panels` track: Base UI still owns it — its id, its `aria-labelledby`, `inert` while
 * it is not the selected one — but `hidden` is taken off it, because a panel that is never in the
 * layout cannot be slid out of the way. Instead it stays in its lane, out of sight past the clip,
 * and out of focus by being `inert`.
 */
function TrackPanel({ className, transition = true, value, children, ...props }: PanelProps) {
	return (
		<BaseTabs.Panel
			value={value}
			keepMounted
			render={({ hidden, ...panelProps }) => (
				<div
					{...panelProps}
					data-slot="tabs-panel"
					className={cn(
						'min-w-0 text-sm outline-none',
						// Blurred until it is the lane on screen: that is what makes the one arriving read
						// as arriving, coming into focus as it lands. Two filters named, so there is a pair
						// to move between — `inert` is Base UI's word for "not the selected one".
						'transition-[filter] duration-(--duration-state) ease-(--ease-overlay)',
						'[filter:blur(0px)] inert:[filter:blur(var(--blur-inactive))]',
						className,
					)}
				>
					{transition === false ? children : <Transition>{children}</Transition>}
				</div>
			)}
			{...props}
		/>
	);
}

/**
 * A panel whose contents sit in a `Transition`. Content that changes size — a body answered for
 * every tab, a list that gains a line — eases to its new size instead of jumping.
 */
function StackedPanel({ className, transition = true, value, children, ...props }: PanelProps) {
	return (
		<BaseTabs.Panel
			data-slot="tabs-panel"
			value={value}
			// Every panel claims the one cell after the list, so the panel leaving and the panel
			// arriving overlap for the length of the transition instead of stacking end to end.
			className={cn(
				'col-start-1 row-start-2 min-w-0 text-sm',
				'data-[orientation=vertical]:col-start-2 data-[orientation=vertical]:row-start-1',
				'transition-[opacity,translate]',
				'duration-(--duration-overlay) ease-(--ease-overlay)',
				'data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:pointer-events-none',
				'data-starting-style:data-[activation-direction=left]:-translate-x-(--shift-content)',
				'data-starting-style:data-[activation-direction=right]:translate-x-(--shift-content)',
				'data-ending-style:data-[activation-direction=left]:translate-x-(--shift-content)',
				'data-ending-style:data-[activation-direction=right]:-translate-x-(--shift-content)',
				className,
			)}
			{...props}
		>
			{transition === false ? children : <Transition>{children}</Transition>}
		</BaseTabs.Panel>
	);
}

/** The panel for the lane it is in: in a track it is slid, stacked it is cross-faded. */
export function Panel(props: PanelProps) {
	const tracked = useContext(TrackContext);
	return tracked ? <TrackPanel {...props} /> : <StackedPanel {...props} />;
}

export type PanelsProps = Omit<ComponentProps<'div'>, 'children'> & {
	/** One `Tabs.Panel` per tab, in the order the tabs are in. */
	children: ReactNode;
};

/**
 * Every panel at once, side by side on one track that is slid to the selected one — so the panel
 * arriving and the panel leaving travel together, instead of one fading over the other. The box
 * holding the track is only as tall as the lane on screen, and follows it as the track moves.
 *
 * Both movements are springs handed to the browser, and neither of them is React state: measuring a
 * lane and storing its height would re-render every panel under the track on every frame that a
 * font arrived. The track is one percentage translate plus a pixel correction — the correction is
 * where the track already was, so a click made mid-flight takes over at that speed instead of
 * jumping back to the lane it came from.
 *
 * `overflow: clip` is what hides the lanes that are not the selected one; nothing inside a panel
 * can therefore hang out of it.
 */
export function Panels({ className, children, ...props }: PanelsProps) {
	const activeValue = useContext(ActiveContext);
	const slide = useSpring(springSlide);
	const size = useSpring(springSize);
	const quick = useSpring(quickSize);

	const panes = Children.toArray(children);
	const selected = panes.findIndex(
		(pane) => isValidElement<{ value?: TabsValue }>(pane) && pane.props.value === activeValue,
	);
	const index = Math.max(0, selected);

	const boxRef = useRef<HTMLDivElement | null>(null);
	const trackRef = useRef<HTMLDivElement | null>(null);
	const laneRefs = useRef<Array<HTMLDivElement | null>>([]);
	/** The height the lanes have asked for, so a repeat measurement is not a re-target. */
	const wanted = useRef<number | null>(null);
	const growing = useRef<Run | null>(null);
	const sliding = useRef<Run | null>(null);
	/**
	 * Whether the box has been painted yet. The first lane it measures is the first one anybody sees,
	 * so the box takes that height rather than gliding into it from whatever the lanes added up to.
	 */
	const painted = useRef(false);

	useEffect(() => {
		const frame = requestAnimationFrame(() => {
			painted.current = true;
		});
		return () => cancelAnimationFrame(frame);
	}, []);

	// The box follows the lane on screen. Written to the element rather than to state: the height of
	// a panel is not something any element under it needs to render again for.
	const follow = useCallback(() => {
		const box = boxRef.current;
		const lane = laneRefs.current[index];
		if (box === null || lane === null || lane === undefined) return;

		const rect = box.getBoundingClientRect();
		const style = getComputedStyle(box);
		const scale = scaleOf(box, style, rect);
		const edge = frameOf(style);
		const borderBox = lane.getBoundingClientRect().height / scale.y + edge.y;

		if (wanted.current !== null && Math.abs(wanted.current - borderBox) < 0.5) return;
		wanted.current = borderBox;

		const from = edge.fit(rect.height / scale.y, edge.y);
		const to = edge.fit(borderBox, edge.y);
		// Read before the glide is interrupted: after that there is no curve to ask.
		const velocity = interrupt(growing);

		box.style.height = `${to}px`;
		// A few pixels is a settle, not a move.
		if (Math.abs(from - to) < HAIRLINE || !painted.current) return;

		startGlide(
			growing,
			box,
			[{ height: `${from}px` }, { height: `${to}px` }],
			sizePreset(to - from, size, quick),
			{ from, to, velocity },
		);
	}, [index, quick, size]);

	// The track, as one percentage translate with a pixel correction on top of it. The correction is
	// measured, not tracked in a ref: where the track is on screen is the one thing an interruption
	// has to know, and a cancelled animation has already put it back.
	useLayoutEffect(() => {
		const track = trackRef.current;
		if (track === null) return;

		const to = `${-index * 100}%`;
		const before = track.getBoundingClientRect();
		const scale = scaleOf(track, getComputedStyle(track), before);
		// Read before the glide is interrupted: after that there is no curve to ask.
		const velocity = interrupt(sliding);

		track.style.transform = `translateX(${to})`;
		const jump = (before.left - track.getBoundingClientRect().left) / scale.x;
		if (Math.abs(jump) < 0.5) return;

		startGlide(
			sliding,
			track,
			[{ translate: `${jump}px 0px` }, { translate: '0px 0px' }],
			slide,
			{ from: jump, to: 0, velocity },
		);
	}, [index, slide]);

	useLayoutEffect(() => {
		follow();
		const lane = laneRefs.current[index];
		if (lane === null || lane === undefined) return;

		// Inside a frame, because this sets the height of the box the lane is measured against.
		const observer = new ResizeObserver(() => requestAnimationFrame(follow));
		observer.observe(lane);
		return () => observer.disconnect();
	}, [index, follow]);

	return (
		<div
			ref={boxRef}
			data-slot="tabs-panels"
			className={cn('overflow-clip', className)}
			{...props}
		>
			<div ref={trackRef} data-slot="tabs-track" className="flex items-start">
				<TrackContext.Provider value>
					{panes.map((pane, lane) => (
						<div
							key={paneKey(pane, lane)}
							data-slot="tabs-lane"
							ref={(element) => {
								laneRefs.current[lane] = element;
							}}
							className="w-full shrink-0"
						>
							{pane}
						</div>
					))}
				</TrackContext.Provider>
			</div>
		</div>
	);
}

export type RootProps = ComponentProps<typeof BaseTabs.Root> & {
	variant?: TabsVariant;
	size?: TabsSize;
};

/**
 * Base UI owns the value. It is mirrored here because a part that is not a Base UI part — the
 * track that has to know how many lanes to the left the selected one is — has to read it too, and
 * it is handed out through a context of its own so that a click on a tab does not re-render the
 * look every tab already agreed on.
 */
export function Root({
	className,
	variant = 'rounded',
	size = 'md',
	value,
	defaultValue,
	onValueChange,
	children,
	...props
}: RootProps) {
	const [selected, setSelected] = useState<TabsValue>(() => defaultValue);

	const handleValueChange = useCallback(
		(next: TabsValue, details: Parameters<NonNullable<RootProps['onValueChange']>>[1]) => {
			onValueChange?.(next, details);
			if (details.reason === 'none' && details.isCanceled) return;
			setSelected(() => next);
		},
		[onValueChange],
	);

	const activeValue = value !== undefined ? value : selected;
	const context = useMemo(() => ({ variant, size }), [variant, size]);

	return (
		<TabsContext.Provider value={context}>
			<ActiveContext.Provider value={activeValue}>
				<BaseTabs.Root
					data-slot="tabs"
					data-variant={variant}
					data-size={size}
					value={value}
					defaultValue={defaultValue}
					onValueChange={handleValueChange}
					className={cn(
						'grid grid-cols-1 gap-4',
						'data-[orientation=vertical]:grid-cols-[auto_1fr] data-[orientation=vertical]:items-start',
						className,
					)}
					{...props}
				>
					<TrackContext.Provider value={false}>{children}</TrackContext.Provider>
				</BaseTabs.Root>
			</ActiveContext.Provider>
		</TabsContext.Provider>
	);
}

export const tabVariants = tv({
	base: [
		'relative z-1 flex cursor-pointer items-center justify-center gap-1.5',
		'font-medium whitespace-nowrap select-none',
		'text-muted-foreground transition-[color,translate] duration-(--duration-state)',
		'active:translate-y-(--press-offset)',
		'hover:text-foreground data-active:text-foreground',
		'data-disabled:pointer-events-none data-disabled:opacity-50',
		iconSlot,
	],
	variants: {
		variant: {
			rounded: 'rounded-md',
			pill: 'rounded-md data-active:text-secondary-foreground',
			// Both of these are shaped by the space their indicator needs, not by a fixed height.
			square: 'h-auto! rounded-none py-2',
			point: 'h-auto! rounded-none pt-1.5 pb-3',
		},
		size: {
			sm: 'h-7 px-2.5 text-xs',
			md: 'h-8 px-3 text-sm',
			lg: 'h-9 px-4 text-sm',
		},
	},
	defaultVariants: {
		variant: 'rounded',
		size: 'md',
	},
});

export type TabProps = Omit<ComponentProps<typeof BaseTabs.Tab>, 'className'> &
	VariantProps<typeof tabVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
	};

export function Tab({ className, variant, size, ...props }: TabProps) {
	const context = useTabs();
	const resolvedVariant = variant ?? context.variant;
	const resolvedSize = size ?? context.size;

	return (
		<BaseTabs.Tab
			data-slot="tabs-tab"
			data-variant={resolvedVariant}
			data-size={resolvedSize}
			className={cn(tabVariants({ variant: resolvedVariant, size: resolvedSize }), className)}
			{...props}
		/>
	);
}

/** Base UI supplies behaviour, these parts supply appearance. Compose with `render`. */
export const Tabs = {
	Root,
	List,
	Tab,
	/** Panels stacked in one cell, cross-fading as they take over from each other. */
	Panel,
	/** Panels side by side on a track, slid to the selected one. Wrap the `Panel`s in this. */
	Panels,
	/** The moving highlight. One per `Tabs.List`. */
	Indicator,
};
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Tabs/demos/basic.tsx

```tsx
import { Tabs } from '@/components/ui/tabs';

const items = [
	{ value: 'overview', label: 'overview', content: 'workspace stats and activity.' },
	{ value: 'activity', label: 'activity', content: 'who changed what, and when.' },
	{ value: 'settings', label: 'settings', content: 'profile and preferences.' },
];

export default function Basic() {
	return (
		<Tabs.Root defaultValue="overview" className="w-full max-w-sm">
			<Tabs.List>
				{items.map(({ value, label }) => (
					<Tabs.Tab key={value} value={value}>
						{label}
					</Tabs.Tab>
				))}
				<Tabs.Indicator />
			</Tabs.List>
			{items.map(({ value, content }) => (
				<Tabs.Panel key={value} value={value} className="text-muted-foreground">
					{content}
				</Tabs.Panel>
			))}
		</Tabs.Root>
	);
}
```

### src/pages/Tabs/demos/canceled.tsx

```tsx
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs } from '@/components/ui/tabs';

export default function Canceled() {
	const [locked, setLocked] = useState(true);

	return (
		<div className="w-full max-w-sm space-y-4">
			<label className="flex items-center gap-2 text-sm">
				<Checkbox.Root checked={locked} onCheckedChange={setLocked}>
					<Checkbox.Indicator />
				</Checkbox.Root>
				Keep the current tab
			</label>
			<Tabs.Root
				defaultValue="draft"
				onValueChange={(_, details) => {
					if (locked && details.reason === 'none') details.cancel();
				}}
			>
				<Tabs.List>
					<Tabs.Tab value="draft">Draft</Tabs.Tab>
					<Tabs.Tab value="preview">Preview</Tabs.Tab>
					<Tabs.Indicator />
				</Tabs.List>
				<Tabs.Panels>
					<Tabs.Panel value="draft">Changes are still being written.</Tabs.Panel>
					<Tabs.Panel value="preview">Ready to preview.</Tabs.Panel>
				</Tabs.Panels>
			</Tabs.Root>
		</div>
	);
}
```

### src/pages/Tabs/demos/request.tsx

```tsx
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs } from '@/components/ui/tabs';

/** What each tab asks for, and how much comes back: the length of the answer is the point here. */
const routes = [
	{ value: 'recent', label: 'recent', rows: 2 },
	{ value: 'shared', label: 'shared', rows: 6 },
	{ value: 'archived', label: 'archived', rows: 11 },
];

const WAIT = 900;

type Entry = { name: string; size: string };

/** Stands in for the request a tab makes when it opens: an answer that arrives a moment later. */
function request(rows: number): Promise<Entry[]> {
	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve(
					Array.from({ length: rows }, (_, index) => ({
						name: `note-${String(index + 1).padStart(2, '0')}.md`,
						size: `${(index + 1) * 2} kb`,
					})),
				),
			WAIT,
		);
	});
}

/**
 * A body that asks for its data when it mounts and holds a placeholder until the answer lands —
 * what a tab in a real app does every time it is opened. Nothing measured it ahead of the request:
 * the box is the placeholder's height first and the answer's second, and the glide between them is
 * the same one a swap gets.
 *
 * The `key` on it is what starts the request over: a new route is a new mount, so the state above
 * begins empty without an effect having to clear it.
 */
function Answer({ rows }: { rows: number }) {
	const [entries, setEntries] = useState<Entry[] | null>(null);

	useEffect(() => {
		let live = true;
		request(rows).then((next) => {
			if (live) setEntries(next);
		});
		return () => {
			live = false;
		};
	}, [rows]);

	if (entries === null) {
		return (
			<div className="space-y-2">
				<Skeleton className="h-4 w-2/3" />
				<Skeleton className="h-4 w-1/2" />
			</div>
		);
	}

	return (
		<ul className="divide-y">
			{entries.map((entry) => (
				<li
					key={entry.name}
					className="flex items-baseline justify-between gap-3 py-1.5 first:pt-0 last:pb-0"
				>
					<span className="font-mono text-sm">{entry.name}</span>
					<span className="text-xs text-muted-foreground">{entry.size}</span>
				</li>
			))}
		</ul>
	);
}

export default function Request() {
	const [value, setValue] = useState(routes[0]!.value);
	const route = routes.find((item) => item.value === value) ?? routes[0]!;

	return (
		<div className="w-full max-w-sm space-y-3">
			<Tabs.Root value={value} onValueChange={(next) => setValue(next)}>
				<Tabs.List>
					{routes.map((item) => (
						<Tabs.Tab key={item.value} value={item.value}>
							{item.label}
						</Tabs.Tab>
					))}
					<Tabs.Indicator />
				</Tabs.List>
				<Tabs.Panel value={value}>
					{/* Keyed by the route, so opening a tab asks again instead of reusing the last
					    answer — the reason each switch costs a request. */}
					<Answer key={route.value} rows={route.rows} />
				</Tabs.Panel>
			</Tabs.Root>
			<p className="text-sm text-muted-foreground">
				opening a tab asks again, and the answer is what sizes the panel: the placeholder
				first, the list second.
			</p>
		</div>
	);
}
```

### src/pages/Tabs/demos/sizes.tsx

```tsx
import { Tabs } from '@/components/ui/tabs';

const sizes = ['sm', 'md', 'lg'] as const;
const items = ['overview', 'activity', 'settings'];

export default function Sizes() {
	return (
		<div className="w-full max-w-sm space-y-4">
			{sizes.map((size) => (
				<Tabs.Root key={size} size={size} defaultValue={items[0]!}>
					<Tabs.List>
						{items.map((item) => (
							<Tabs.Tab key={item} value={item}>
								{item}
							</Tabs.Tab>
						))}
						<Tabs.Indicator />
					</Tabs.List>
				</Tabs.Root>
			))}
		</div>
	);
}
```

### src/pages/Tabs/demos/swapped.tsx

```tsx
import { useState } from 'react';
import { Tabs } from '@/components/ui/tabs';

const notes = [
	{ value: 'overview', body: 'nine members, three of them invited this week.' },
	{
		value: 'activity',
		body: 'mira renamed the project, joe deleted two keys, and the nightly job ran late once, twice, three times, and then it stopped.',
	},
	{ value: 'settings', body: 'profile and preferences.' },
];

/** One panel, whose contents are replaced — the box eases to the size of what is inside it now. */
export default function Swapped() {
	const [value, setValue] = useState(notes[0]!.value);
	const note = notes.find((item) => item.value === value) ?? notes[0]!;

	return (
		<Tabs.Root
			value={value}
			onValueChange={(next) => setValue(next)}
			className="w-full max-w-sm"
		>
			<Tabs.List>
				{notes.map(({ value: tab }) => (
					<Tabs.Tab key={tab} value={tab}>
						{tab}
					</Tabs.Tab>
				))}
				<Tabs.Indicator />
			</Tabs.List>
			<Tabs.Panel value={value} className="text-muted-foreground">
				{note.body}
			</Tabs.Panel>
		</Tabs.Root>
	);
}
```

### src/pages/Tabs/demos/tracked.tsx

```tsx
import { Tabs } from '@/components/ui/tabs';

const notes = [
	{ value: 'overview', body: 'nine members, three of them invited this week.' },
	{
		value: 'activity',
		body: 'mira renamed the project, joe deleted two keys, and the nightly job ran late once.',
	},
	{ value: 'settings', body: 'profile and preferences.' },
];

/** Every panel on one track: the one arriving and the one leaving travel together. */
export default function Tracked() {
	return (
		<Tabs.Root defaultValue="overview" className="w-full max-w-sm">
			<Tabs.List>
				{notes.map(({ value }) => (
					<Tabs.Tab key={value} value={value}>
						{value}
					</Tabs.Tab>
				))}
				<Tabs.Indicator />
			</Tabs.List>
			<Tabs.Panels>
				{notes.map(({ value, body }) => (
					<Tabs.Panel key={value} value={value} className="text-muted-foreground">
						{body}
					</Tabs.Panel>
				))}
			</Tabs.Panels>
		</Tabs.Root>
	);
}
```

### src/pages/Tabs/demos/variants.tsx

```tsx
import { Tabs } from '@/components/ui/tabs';

const variants = ['rounded', 'pill', 'square', 'point'] as const;
const items = ['overview', 'activity', 'settings'];

export default function Variants() {
	return (
		<div className="w-full max-w-sm space-y-6">
			{variants.map((variant) => (
				<Tabs.Root key={variant} variant={variant} defaultValue={items[0]!}>
					<Tabs.List>
						{items.map((item) => (
							<Tabs.Tab key={item} value={item}>
								{item}
							</Tabs.Tab>
						))}
						<Tabs.Indicator />
					</Tabs.List>
					<Tabs.Panel value={items[0]!} className="text-muted-foreground">
						variant=&quot;{variant}&quot;
					</Tabs.Panel>
				</Tabs.Root>
			))}
		</div>
	);
}
```

### src/pages/Tabs/demos/vertical.tsx

```tsx
import { Tabs } from '@/components/ui/tabs';

export default function Vertical() {
	return (
		<Tabs.Root defaultValue="general" orientation="vertical" className="w-full max-w-sm">
			<Tabs.List>
				<Tabs.Tab value="general">general</Tabs.Tab>
				<Tabs.Tab value="billing" disabled>
					billing
				</Tabs.Tab>
				<Tabs.Tab value="danger">danger zone</Tabs.Tab>
				<Tabs.Indicator />
			</Tabs.List>
			<Tabs.Panel value="general" className="text-muted-foreground">
				workspace name, url and icon.
			</Tabs.Panel>
			<Tabs.Panel value="danger" className="text-muted-foreground">
				deleting a workspace cannot be undone.
			</Tabs.Panel>
		</Tabs.Root>
	);
}
```
