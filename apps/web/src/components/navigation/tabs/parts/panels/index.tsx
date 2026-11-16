import type { Tabs as BaseTabs } from '@base-ui/react/tabs';
import {
	Children,
	isValidElement,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	type ComponentProps,
	type ReactNode,
} from 'react';
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
import { cn } from '@/lib/utils';
import { ActiveContext, TrackContext } from '../context';

/** Whatever a `TabsTab` is held to — the same values Base UI accepts. */
export type TabsValue = ComponentProps<typeof BaseTabs.Tab>['value'];

/** A lane is named by the value of the panel in it, so a reorder is a move rather than a remount. */
function paneKey({ pane, lane }: { pane: ReactNode; lane: number }) {
	return isValidElement<{ value?: TabsValue }>(pane) ? (pane.props.value ?? lane) : lane;
}

export type TabsPanelsProps = Omit<ComponentProps<'div'>, 'children'> & {
	/** One `TabsPanel` per tab, in the order the tabs are in. */
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
export function TabsPanels({ className, children, ...props }: TabsPanelsProps) {
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
		<div ref={boxRef} data-slot="tabs-panels" className={cn('overflow-clip', className)} {...props}>
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
