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
import { LumoTransition } from './transition';

export type TabsVariant = 'rounded' | 'pill' | 'square' | 'point';
export type TabsSize = 'sm' | 'md' | 'lg';

/** Whatever a `LumoTabs.Tab` is held to — the same values Base UI accepts. */
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
function paneKey({ pane, lane }: { pane: ReactNode; lane: number }) {
	return isValidElement<{ value?: TabsValue }>(pane) ? (pane.props.value ?? lane) : lane;
}

/** The variant and size set on `LumoTabs.Root`, which every part inherits unless it overrides one. */
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
	 * Whether the panel's contents sit in a `LumoTransition`, whose box eases to their size. `false`
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
					{transition === false ? children : <LumoTransition>{children}</LumoTransition>}
				</div>
			)}
			{...props}
		/>
	);
}

/**
 * A panel whose contents sit in a `LumoTransition`. Content that changes size — a body answered for
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
			{transition === false ? children : <LumoTransition>{children}</LumoTransition>}
		</BaseTabs.Panel>
	);
}

/** The panel for the lane it is in: in a track it is slid, stacked it is cross-faded. */
export function Panel(props: PanelProps) {
	const tracked = useContext(TrackContext);
	return tracked ? <TrackPanel {...props} /> : <StackedPanel {...props} />;
}

export type PanelsProps = Omit<ComponentProps<'div'>, 'children'> & {
	/** One `LumoTabs.Panel` per tab, in the order the tabs are in. */
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
		const scale = scaleOf({ element: box, style, rect });
		const edge = frameOf(style);
		const borderBox = lane.getBoundingClientRect().height / scale.y + edge.y;

		if (wanted.current !== null && Math.abs(wanted.current - borderBox) < 0.5) return;
		wanted.current = borderBox;

		const from = edge.fit({ size: rect.height / scale.y, edge: edge.y });
		const to = edge.fit({ size: borderBox, edge: edge.y });
		// Read before the glide is interrupted: after that there is no curve to ask.
		const velocity = interrupt(growing);

		box.style.height = `${to}px`;
		// A few pixels is a settle, not a move.
		if (Math.abs(from - to) < HAIRLINE || !painted.current) return;

		startGlide({
			run: growing,
			element: box,
			frames: [{ height: `${from}px` }, { height: `${to}px` }],
			preset: sizePreset({ distance: to - from, long: size, short: quick }),
			slide: { from, to, velocity },
		});
	}, [index, quick, size]);

	// The track, as one percentage translate with a pixel correction on top of it. The correction is
	// measured, not tracked in a ref: where the track is on screen is the one thing an interruption
	// has to know, and a cancelled animation has already put it back.
	useLayoutEffect(() => {
		const track = trackRef.current;
		if (track === null) return;

		const to = `${-index * 100}%`;
		const before = track.getBoundingClientRect();
		const scale = scaleOf({ element: track, style: getComputedStyle(track), rect: before });
		// Read before the glide is interrupted: after that there is no curve to ask.
		const velocity = interrupt(sliding);

		track.style.transform = `translateX(${to})`;
		const jump = (before.left - track.getBoundingClientRect().left) / scale.x;
		if (Math.abs(jump) < 0.5) return;

		startGlide({
			run: sliding,
			element: track,
			frames: [{ translate: `${jump}px 0px` }, { translate: '0px 0px' }],
			preset: slide,
			slide: { from: jump, to: 0, velocity },
		});
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
							key={paneKey({ pane, lane })}
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
export const LumoTabs = {
	Root,
	List,
	Tab,
	/** Panels stacked in one cell, cross-fading as they take over from each other. */
	Panel,
	/** Panels side by side on a track, slid to the selected one. Wrap the `Panel`s in this. */
	Panels,
	/** The moving highlight. One per `LumoTabs.List`. */
	Indicator,
};
