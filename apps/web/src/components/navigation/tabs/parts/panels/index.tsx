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

export type TabsValue = ComponentProps<typeof BaseTabs.Tab>['value'];

function paneKey({ pane, lane }: { pane: ReactNode; lane: number }) {
	return isValidElement<{ value?: TabsValue }>(pane) ? (pane.props.value ?? lane) : lane;
}

export type TabsPanelsProps = Omit<ComponentProps<'div'>, 'children'> & {
	children: ReactNode;
};

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
	const wanted = useRef<number | null>(null);
	const growing = useRef<Run | null>(null);
	const sliding = useRef<Run | null>(null);
	const painted = useRef(false);

	useEffect(() => {
		const frame = requestAnimationFrame(() => {
			painted.current = true;
		});
		return () => cancelAnimationFrame(frame);
	}, []);

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
		const velocity = interrupt(growing);

		box.style.height = `${to}px`;
		if (Math.abs(from - to) < HAIRLINE || !painted.current) return;

		startGlide({
			run: growing,
			element: box,
			frames: [{ height: `${from}px` }, { height: `${to}px` }],
			preset: sizePreset({ distance: to - from, long: size, short: quick }),
			slide: { from, to, velocity },
		});
	}, [index, quick, size]);

	useLayoutEffect(() => {
		const track = trackRef.current;
		if (track === null) return;

		const to = `${-index * 100}%`;
		const before = track.getBoundingClientRect();
		const scale = scaleOf({ element: track, style: getComputedStyle(track), rect: before });
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
