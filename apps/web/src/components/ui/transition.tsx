import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
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

export type TransitionProps = {
	/** Merged last through `cn()`, onto the box whose size glides. */
	className?: string;
	/**
	 * A height to hold instead of the content's own, in pixels — the closed end of a fold, and the
	 * peek of one. A box holding a height clips, because its content is taller than it is.
	 */
	height?: number;
	/** One block of content. Its size is what the box follows. */
	children: ReactNode;
};

/** The size the box is meant to be. No width means the page sizes it, not the content. */
type Size = { width?: number; height: number };

/** What sizes the box: the content, or the page. Decided once, when content has a size. */
type Mode = 'page' | 'content';

const px = (value: string) => Number.parseFloat(value) || 0;

/**
 * The width the box has to work with: the parent's content box, margins taken out, or `null` when
 * there is no block parent to hand one over.
 */
function room(box: HTMLElement, style: CSSStyleDeclaration): number | null {
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

/** The content's height, measured at the width the box is heading for rather than the one it is at. */
function heightOf(content: HTMLElement, width: number | undefined, edge: Frame, scale: Scale) {
	if (width !== undefined) content.style.width = `${edge.fit(width, edge.x)}px`;
	const height = content.getBoundingClientRect().height / scale.y + edge.y;
	if (width !== undefined) content.style.removeProperty('width');
	return height;
}

/**
 * How long after its first frame a box is still being measured rather than being used. Content that
 * arrives in that window — a fold that opens itself because its body turned out to be short, a
 * grammar that lands — is the box's size being discovered, not a change a reader asked to see.
 */
const SETTLING = 120;

/** Whether two targets ask for the same size — a repeat measurement rather than a change. */
function same(a: Size, b: Size) {
	if (Math.abs(a.height - b.height) >= 0.5) return false;
	if (a.width === undefined || b.width === undefined) return a.width === b.width;
	return Math.abs(a.width - b.width) < 0.5;
}

/** Whether the box is already the size measured — a child sizing itself off the box, not a change. */
function at(live: Size, size: Size) {
	if (Math.abs(live.height - size.height) >= 0.5) return false;
	return size.width === undefined || Math.abs((live.width ?? 0) - size.width) < 0.5;
}

/** Whether the size measured is somewhere other than where the box is. */
function travels(live: Size, size: Size) {
	if (Math.abs(live.height - size.height) >= HAIRLINE) return true;
	return size.width !== undefined && Math.abs((live.width ?? 0) - size.width) >= HAIRLINE;
}

/**
 * A box that holds one block of content and keeps its size to what is inside it.
 *
 * The height is the box's own: measured, and glided to each new one, so content that grows,
 * shrinks or re-wraps — a swap, a late font, a list that gains a line — never moves the page
 * beneath it. The width belongs to the page whenever the page sizes the box, and is measured and
 * glided the same way when it is the content that sizes it (a `w-fit` pill, a chip). Give it a
 * `height` and it holds that instead, which is how a fold stays closed at 0, or at a peek.
 *
 * The glide is a spring, sampled once into a `linear()` curve and handed to `Animation.animate()`,
 * so it runs in the browser rather than in a callback. An interruption reads the curve's own speed
 * and gives it to the next one, so a box that changes its mind mid-flight turns around from where
 * it is instead of starting from a standstill.
 *
 * It starts in the measurement itself, not a render later: a measurement arrives from a
 * `ResizeObserver` — outside React — so the clip and the first frame of the animation have to be
 * written in the same task, or the new content shows past the old height for a frame.
 *
 * The content is replaced in place, not remounted: no fade, no travel, no second copy of the
 * same text underneath — a clip and a measured glide are the whole of it.
 */
export function Transition({ className, height, children }: TransitionProps) {
	const spring = useSpring(springSize);
	const quick = useSpring(quickSize);
	const boxRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	/** The size the box is meant to be, so a measurement can tell a change from a repeat. */
	const target = useRef<Size | undefined>(undefined);
	const mode = useRef<Mode | undefined>(undefined);
	const running = useRef<Run | null>(null);
	/** The height the box was told to hold, read where a measurement starts and not from a render. */
	const held = useRef(height);
	/**
	 * Whether the box has been painted at all yet. The first size it settles on is the size it is seen
	 * at for the first time, so there is nothing to glide from — a fold that opens itself before the
	 * page has drawn (a preview too short to fold) would otherwise arrive with an entrance animation
	 * nobody asked for.
	 */
	const painted = useRef(false);
	/** When the box stops settling: until then a measurement is taken, not glided to. */
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

		// Where the box is now, not where the last glide was heading: an interrupted one continues
		// from what is on screen. Screen pixels, converted once by the scale they were measured at.
		const rect = box.getBoundingClientRect();
		const style = getComputedStyle(box);
		const scale = scaleOf(box, style, rect);
		const edge = frameOf(style);
		const live: Size = { width: rect.width / scale.x, height: rect.height / scale.y };
		const hold = held.current;

		// The first size is the first one anybody sees, so it is taken rather than glided to — and it is
		// the size the browser has already given the box: nothing is measured, and nothing is written
		// unless the box holds a height of its own. A page mounts a fold per example, and each write
		// here would force the next box's read to lay the page out again.
		if (!painted.current) {
			if (hold === undefined) {
				// Opened before the first paint — a preview too short to fold — so the box has no size of
				// its own yet. Give the height back to the browser and let its first measurement be the
				// size the box is first seen at.
				box.style.removeProperty('height');
				box.style.removeProperty('width');
				box.style.removeProperty('overflow');
				target.current = undefined;
				return;
			}

			target.current = { width: undefined, height: hold };
			box.style.height = `${edge.fit(hold, edge.y)}px`;
			box.style.overflow = 'clip';
			return;
		}

		// Not laid out yet — inside a closed dialog or a hidden tab — so not a size to decide on. A box
		// holding a height is a decided size already, whatever its content is doing.
		if (
			hold === undefined &&
			mode.current === undefined &&
			content.getBoundingClientRect().height === 0
		)
			return;

		// A box the page sizes keeps the width the page gives it, and only its height is the box's to
		// glide. A box the content sizes is measured in both directions — and the answer to which one
		// it is does not change, so it is asked only while it can still change.
		let width: number | undefined;
		if (mode.current !== 'page') {
			// `max-content`, to ask the content how wide it wants to be — free of the width the box
			// is pinned at now, which would only wrap what it measured.
			content.style.width = 'max-content';
			const natural = content.getBoundingClientRect().width / scale.x + edge.x;
			content.style.removeProperty('width');

			const limit = room(box, style);
			const fits = limit === null || natural <= limit + 0.5;
			const own = mode.current === 'content' || Math.abs(natural - (live.width ?? 0)) < 0.5;

			if (own && fits) {
				mode.current = 'content';
				width = natural;
			} else {
				// Content that wants more room than the page has is the page's to give, and it wraps
				// there, which is what `w-fit` would have computed anyway.
				mode.current = 'page';
			}
		}

		const next: Size =
			hold === undefined
				? { width, height: heightOf(content, width, edge, scale) }
				: { width, height: hold };

		const previous = target.current;
		if (previous !== undefined && same(previous, next)) return;
		// A child that sizes itself off the box (`h-full`) would re-aim the glide at wherever the box
		// currently is, and park it there.
		if (running.current !== null && at(live, next)) return;

		target.current = next;

		const from = edge.fit(live.height, edge.y);
		const to = edge.fit(next.height, edge.y);
		const toWidth = next.width === undefined ? undefined : edge.fit(next.width, edge.x);
		// Read before the glide is interrupted: after that there is no curve to ask.
		const velocity = interrupt(running);

		// The box's own style is written to the end state before the glide starts, so a landing has
		// nothing to hand back, and an interruption lands where a reader would expect.
		box.style.height = `${to}px`;
		if (toWidth === undefined) box.style.removeProperty('width');
		else box.style.width = `${toWidth}px`;

		// Clipped only while the box is a size the content is not: while gliding, and while it holds
		// a height of its own. Once it is the content's size again, an overlay hanging out of it is
		// its own business.
		if (hold !== undefined) box.style.overflow = 'clip';

		if (
			previous === undefined ||
			!travels(live, next) ||
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
			frames[0]!.width = `${edge.fit(live.width ?? 0, edge.x)}px`;
			frames[1]!.width = `${toWidth}px`;
		}

		const landed = startGlide(
			running,
			box,
			frames,
			sizePreset(to - from, spring, quick),
			{ from, to, velocity },
			() => {
				box.removeAttribute('data-swapping');
				if (held.current === undefined) box.style.removeProperty('overflow');
			},
		);

		// No motion: the box has already been written at its end size, so there is only the clip to
		// hand back.
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

		// Anything inside that changes size re-targets the glide rather than snapping: content that
		// wraps at a new width, a font that arrives late, a list that gains a line.
		const observer = new ResizeObserver(follow);
		observer.observe(content);
		return () => observer.disconnect();
	}, [follow]);

	useEffect(() => () => running.current?.animation.cancel(), []);

	return (
		// Relative, so an absolutely positioned child lands against the box it is measured in.
		<div ref={boxRef} data-slot="transition" className={cn('relative', className)}>
			{/* flow-root keeps the margins of what is inside inside, so what is measured here is the
			    size the content actually takes. */}
			<div ref={contentRef} data-slot="transition-content" className="flow-root">
				{children}
			</div>
		</div>
	);
}
