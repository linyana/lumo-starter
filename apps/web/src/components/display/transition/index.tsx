import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { frameOf, HAIRLINE, scaleOf, type Frame, type Scale } from '@/lib/measure';
import {
	interrupt,
	quickSize,
	sizePreset,
	springSize,
	startGlide,
	useSpring,
	type Run,
} from '@/lib/motion';
import { cn } from '@/lib/utils';

export type TransitionProps = {
	className?: string;
	height?: number;
	children: ReactNode;
};

type Size = { width?: number; height: number };

type Mode = 'page' | 'content';

const px = (value: string) => Number.parseFloat(value) || 0;

function room({ box, style }: { box: HTMLElement; style: CSSStyleDeclaration }): number | null {
	const parent = box.parentElement;
	if (parent === null || parent.clientWidth === 0) return null;
	const out = getComputedStyle(parent);
	return (
		parent.clientWidth -
		px(out.paddingLeft) -
		px(out.paddingRight) -
		px(style.marginLeft) -
		px(style.marginRight)
	);
}

function heightOf({
	content,
	width,
	edge,
	scale,
}: {
	content: HTMLElement;
	width: number | undefined;
	edge: Frame;
	scale: Scale;
}) {
	if (width !== undefined) content.style.width = `${edge.fit({ size: width, edge: edge.x })}px`;
	const height = content.getBoundingClientRect().height / scale.y + edge.y;
	if (width !== undefined) content.style.removeProperty('width');
	return height;
}

const SETTLING = 120;

function same({ a, b }: { a: Size; b: Size }) {
	if (Math.abs(a.height - b.height) >= 0.5) return false;
	if (a.width === undefined || b.width === undefined) return a.width === b.width;
	return Math.abs(a.width - b.width) < 0.5;
}

function at({ live, size }: { live: Size; size: Size }) {
	if (Math.abs(live.height - size.height) >= 0.5) return false;
	return size.width === undefined || Math.abs((live.width ?? 0) - size.width) < 0.5;
}

function travels({ live, size }: { live: Size; size: Size }) {
	if (Math.abs(live.height - size.height) >= HAIRLINE) return true;
	return size.width !== undefined && Math.abs((live.width ?? 0) - size.width) >= HAIRLINE;
}

export function Transition({ className, height, children }: TransitionProps) {
	const spring = useSpring(springSize);
	const quick = useSpring(quickSize);
	const boxRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const target = useRef<Size | undefined>(undefined);
	const mode = useRef<Mode | undefined>(undefined);
	const running = useRef<Run | null>(null);
	const held = useRef(height);
	const painted = useRef(false);
	const settleBy = useRef(0);

	useEffect(() => {
		settleBy.current = performance.now() + SETTLING;
		const frame = requestAnimationFrame(() => {
			painted.current = true;
		});
		return () => cancelAnimationFrame(frame);
	}, []);

	const follow = useCallback(() => {
		const box = boxRef.current;
		const content = contentRef.current;
		if (box === null || content === null) return;

		const rect = box.getBoundingClientRect();
		const style = getComputedStyle(box);
		const scale = scaleOf({ element: box, style, rect });
		const edge = frameOf(style);
		const live: Size = { width: rect.width / scale.x, height: rect.height / scale.y };
		const hold = held.current;

		if (!painted.current) {
			if (hold === undefined) {
				box.style.removeProperty('height');
				box.style.removeProperty('width');
				box.style.removeProperty('overflow');
				target.current = undefined;
				return;
			}

			target.current = { width: undefined, height: hold };
			box.style.height = `${edge.fit({ size: hold, edge: edge.y })}px`;
			box.style.overflow = 'clip';
			return;
		}

		if (
			hold === undefined &&
			mode.current === undefined &&
			content.getBoundingClientRect().height === 0
		)
			return;

		let width: number | undefined;
		if (mode.current !== 'page') {
			content.style.width = 'max-content';
			const natural = content.getBoundingClientRect().width / scale.x + edge.x;
			content.style.removeProperty('width');

			const limit = room({ box, style });
			const fits = limit === null || natural <= limit + 0.5;
			const own = mode.current === 'content' || Math.abs(natural - (live.width ?? 0)) < 0.5;

			if (own && fits) {
				mode.current = 'content';
				width = natural;
			} else {
				mode.current = 'page';
			}
		}

		const next: Size =
			hold === undefined
				? { width, height: heightOf({ content, width, edge, scale }) }
				: { width, height: hold };

		const previous = target.current;
		if (previous !== undefined && same({ a: previous, b: next })) return;
		if (running.current !== null && at({ live, size: next })) return;

		target.current = next;

		const from = edge.fit({ size: live.height, edge: edge.y });
		const to = edge.fit({ size: next.height, edge: edge.y });
		const toWidth =
			next.width === undefined ? undefined : edge.fit({ size: next.width, edge: edge.x });
		const velocity = interrupt(running);

		box.style.height = `${to}px`;
		if (toWidth === undefined) box.style.removeProperty('width');
		else box.style.width = `${toWidth}px`;

		if (hold !== undefined) box.style.overflow = 'clip';

		if (
			previous === undefined ||
			!travels({ live, size: next }) ||
			!painted.current ||
			performance.now() < settleBy.current
		) {
			if (hold === undefined) box.style.removeProperty('overflow');
			box.removeAttribute('data-swapping');
			return;
		}

		box.style.overflow = 'clip';
		box.setAttribute('data-swapping', '');

		const frames: Keyframe[] = [{ height: `${from}px` }, { height: `${to}px` }];
		if (toWidth !== undefined) {
			frames[0]!.width = `${edge.fit({ size: live.width ?? 0, edge: edge.x })}px`;
			frames[1]!.width = `${toWidth}px`;
		}

		const landed = startGlide({
			run: running,
			element: box,
			frames,
			preset: sizePreset({ distance: to - from, long: spring, short: quick }),
			slide: { from, to, velocity },
			settle: () => {
				box.removeAttribute('data-swapping');
				if (held.current === undefined) box.style.removeProperty('overflow');
			},
		});

		if (landed === undefined) {
			box.removeAttribute('data-swapping');
			if (held.current === undefined) box.style.removeProperty('overflow');
		}
	}, [quick, spring]);

	useLayoutEffect(() => {
		held.current = height;
		follow();
	}, [height, follow]);

	useLayoutEffect(() => {
		const content = contentRef.current;
		if (content === null) return;

		const observer = new ResizeObserver(follow);
		observer.observe(content);
		return () => observer.disconnect();
	}, [follow]);

	useEffect(() => () => running.current?.animation.cancel(), []);

	return (
		<div ref={boxRef} data-slot="transition" className={cn('relative', className)}>
			<div ref={contentRef} data-slot="transition-content" className="flow-root">
				{children}
			</div>
		</div>
	);
}
