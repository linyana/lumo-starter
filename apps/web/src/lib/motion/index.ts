import {
	createGeneratorEasing,
	generateLinearEasing,
	spring,
	useReducedMotion,
	type Transition,
} from 'motion/react';

/**
 * The springs the library moves with. A spring is numbers, not a token, so the numbers live here
 * once instead of at every call site — and `useSpring` is how a component asks for one.
 */

/**
 * A box following the size of what is inside it: a panel opening, a track taking a new height.
 *
 * The damping is what decides whether it stops at the size or goes past it — `2 × √stiffness` is
 * critical, and anything under that overshoots by about `exp(-πζ/√(1-ζ²))`, which on a tall panel
 * is a visible few pixels of wobble at the end. 30 against 300 was ζ 0.87, so it overshot; 36 is
 * ζ 1.04 and lands on the number. A spring given both stiffness and damping ignores `bounce`,
 * which is why the pair is the whole story here.
 */
export const springSize: Transition = {
	type: 'spring',
	stiffness: 300,
	damping: 36,
	restDelta: 0.01,
};

/** A pane travelling into place — the tab track, a step handing over to the next. */
export const springSlide: Transition = {
	type: 'spring',
	stiffness: 350,
	damping: 35,
	bounce: 0,
	restDelta: 0.01,
};

/**
 * A size with nowhere to go: a nav's sub rows, a fold of two lines. A spring covers the same time
 * whatever the distance — which is the point of it on a panel, and the reason a 64px reveal that
 * used one took four hundred milliseconds to say nothing. Below `SHORT_MOVE`, a box is a short
 * ease instead, and it arrives while the reader is still looking at the click.
 */
export const quickSize: Transition = { duration: 0.18, ease: [0.22, 1, 0.36, 1] };

/** The distance, in pixels, under which a size is `quickSize` rather than a spring. */
export const SHORT_MOVE = 120;

/** The preset a size of `distance` should use — the caller's own units, which only it knows. */
export function sizePreset(distance: number, long: Transition, short: Transition) {
	return Math.abs(distance) < SHORT_MOVE ? short : long;
}

/**
 * The preset, or no journey at all when the reader asked for less motion. Tokens collapse CSS
 * durations on their own; a spring is a number in JS, so it has to be asked. The still one is a
 * constant rather than a fresh object, because a component hands it to a callback's dependencies.
 */
export function useSpring(preset: Transition): Transition {
	return useReducedMotion() === true ? STILL : preset;
}

const STILL: Transition = { duration: 0 };

/** Where a glide starts, where it ends, and how fast it is already going, in units per second. */
export type Slide = { from: number; to: number; velocity?: number };

/** The options `createGeneratorEasing` takes, which are motion's own with a distance in them. */
type Generator = Parameters<typeof createGeneratorEasing>[0];

/** A spring as CSS timing: a duration and a `linear()` curve the browser can run on its own. */
export type Timing = {
	/** Milliseconds. Zero means the reader asked for no motion, and the glide is a jump. */
	duration: number;
	/** The curve, sampled — the only easing `Animation.animate()` can take at full speed. */
	easing: string;
	/** The curve as a function, so an interruption can read the speed it is moving at. */
	at: (progress: number) => number;
};

const STEP = 16;

/**
 * How far into a spring's settle the box is within half a pixel of where it is going. A spring has no
 * end — the curve is cut here, so the tail nobody can see does not keep the box clipped.
 */
function endsAt(ease: (progress: number) => number, seconds: number, distance: number) {
	const total = Math.round(seconds * 1000);
	const rest = 0.5 / Math.abs(distance);

	let ms = total;
	while (ms > 0) {
		if (Math.abs(1 - ease(ms / total)) >= rest) return Math.min(ms + STEP, total);
		ms -= STEP;
	}
	return total;
}

/** The four numbers of a `cubic-bezier`, or the axis-aligned curve they draw. */
function bezier(ease: unknown): string {
	if (typeof ease === 'string') return ease;
	if (Array.isArray(ease) && ease.length === 4) return `cubic-bezier(${ease.join(', ')})`;
	return 'linear';
}

/**
 * A spring, converted into the two things `Animation.animate()` understands. `from` and `to` are in
 * the property's own unit — pixels, or a percentage as a number — because a carried velocity is
 * only meaningful against the distance it was measured over.
 *
 * `visualDuration` is deliberately not used here: motion ignores `velocity` when a spring is given
 * one, and a glide that cannot be interrupted smoothly is the thing this exists to avoid.
 */
export function toTiming(preset: Transition, { from, to, velocity = 0 }: Slide): Timing {
	const type = (preset as { type?: string }).type;

	if (type !== 'spring') {
		const options = preset as { duration?: number; ease?: unknown };
		const duration = Math.round((options.duration ?? 0) * 1000);
		return {
			duration,
			easing: bezier(options.ease),
			at: (progress) => (duration === 0 ? 1 : Math.min(Math.max(progress, 0), 1)),
		};
	}

	const { duration, ease } = createGeneratorEasing(
		// `keyframes` is what the generator reads the distance from, and what motion's own type for
		// these options leaves out.
		{ ...preset, keyframes: [from, to], velocity } as unknown as Generator,
		100,
		spring,
	);
	const settled = Math.round(duration * 1000);
	const ms = Math.abs(to - from) < 1 ? settled : endsAt(ease, duration, to - from);

	if (ms === 0) return { duration: 0, easing: 'linear', at: () => 1 };

	// The curve, read over the part of it that is on screen — and the same read as a function, so an
	// interruption measures the speed of what is actually moving rather than of the whole settle.
	const at = (progress: number) => ease((Math.min(Math.max(progress, 0), 1) * ms) / settled);

	return { duration: ms, easing: generateLinearEasing(at, ms), at };
}

/** One glide: the animation, the curve that produced it, and the two ends it travels between. */
export type Run = {
	animation: Animation;
	timing: Timing;
	from: number;
	to: number;
};

/** The glide a component is in the middle of, held in a ref because it is never rendered. */
export type Running = { current: Run | null };

const FRAME = 16;

/**
 * How fast a run is moving right now, in its property's unit per second — the number an interruption
 * hands to the next spring so the box keeps going instead of starting from a standstill.
 *
 * Measured off the curve rather than read from the compositor: the animated value is not a style
 * this script can read without forcing layout, and the curve is already in memory.
 */
export function speedOf(run: Run): number {
	const { animation, timing, from, to } = run;
	if (timing.duration === 0) return 0;

	const now = Math.min(Number(animation.currentTime ?? 0), timing.duration);
	const before = Math.max(0, now - FRAME);
	if (now <= before) return 0;

	const moved = timing.at(now / timing.duration) - timing.at(before / timing.duration);
	return ((to - from) * moved * 1000) / (now - before);
}

/**
 * Takes the glide in `run` out of the way and reports the speed it had reached, in its property's own
 * unit per second. Read before the cancel: an interrupted glide is the number the next one has to
 * start at, or the box would stop dead and set off again from a standstill.
 *
 * The caller writes the end state between this and `startGlide`, so the element is never seen at a
 * size nobody asked for.
 */
export function interrupt(run: Running) {
	const current = run.current;
	run.current = null;
	if (current === null) return 0;

	const velocity = speedOf(current);
	current.animation.cancel();
	return velocity;
}

/**
 * The next glide, booked where the one before it was so a third can interrupt it in turn. `settle`
 * runs when it lands, and only if nothing has taken its place in the meantime.
 *
 * `undefined` when the reader asked for no motion: there is no frame to land on, so the caller
 * arrives by writing the end state, which it has already done.
 */
export function startGlide(
	run: Running,
	element: Element,
	frames: Keyframe[],
	preset: Transition,
	slide: Slide,
	settle?: () => void,
) {
	const timing = toTiming(preset, slide);
	const animation = glide(element, frames, timing);
	if (animation === undefined) return undefined;

	const started: Run = { animation, timing, from: slide.from, to: slide.to };
	run.current = started;

	const park = () => {
		if (run.current !== started) return;
		run.current = null;
		settle?.();
	};
	animation.finished.then(park, park);

	return started;
}

/**
 * Hands a glide to the browser, where it runs without a callback. `undefined` when the reader asked
 * for no motion — the caller writes the end state itself in that case, because there is no frame to
 * land on and no reason to schedule one.
 */
export function glide(element: Element, keyframes: Keyframe[], timing: Timing) {
	if (timing.duration === 0 || typeof element.animate !== 'function') return undefined;
	return element.animate(keyframes, { duration: timing.duration, easing: timing.easing });
}
