import {
	createGeneratorEasing,
	generateLinearEasing,
	spring,
	useReducedMotion,
	type Transition,
} from 'motion/react';

export const springSize: Transition = {
	type: 'spring',
	stiffness: 300,
	damping: 36,
	restDelta: 0.01,
};

export const springSlide: Transition = {
	type: 'spring',
	stiffness: 350,
	damping: 35,
	bounce: 0,
	restDelta: 0.01,
};

export const quickSize: Transition = { duration: 0.18, ease: [0.22, 1, 0.36, 1] };

export const quickSway: Transition = { duration: 0.32, ease: [0.22, 1, 0.36, 1] };

export const SHORT_MOVE = 120;

export function sizePreset({
	distance,
	long,
	short,
}: {
	distance: number;
	long: Transition;
	short: Transition;
}) {
	return Math.abs(distance) < SHORT_MOVE ? short : long;
}

export function useSpring(preset: Transition): Transition {
	return useReducedMotion() === true ? STILL : preset;
}

const STILL: Transition = { duration: 0 };

export type Slide = { from: number; to: number; velocity?: number };

type Generator = Parameters<typeof createGeneratorEasing>[0];

export type Timing = {
	duration: number;
	easing: string;
	at: (progress: number) => number;
};

const STEP = 16;

function endsAt({
	ease,
	seconds,
	distance,
}: {
	ease: (progress: number) => number;
	seconds: number;
	distance: number;
}) {
	const total = Math.round(seconds * 1000);
	const rest = 0.5 / Math.abs(distance);

	let ms = total;
	while (ms > 0) {
		if (Math.abs(1 - ease(ms / total)) >= rest) return Math.min(ms + STEP, total);
		ms -= STEP;
	}
	return total;
}

function bezier(ease: unknown): string {
	if (typeof ease === 'string') return ease;
	if (Array.isArray(ease) && ease.length === 4) return `cubic-bezier(${ease.join(', ')})`;
	return 'linear';
}

export function toTiming({
	preset,
	from,
	to,
	velocity = 0,
}: { preset: Transition } & Slide): Timing {
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
		{ ...preset, keyframes: [from, to], velocity } as unknown as Generator,
		100,
		spring,
	);
	const settled = Math.round(duration * 1000);
	const ms =
		Math.abs(to - from) < 1 ? settled : endsAt({ ease, seconds: duration, distance: to - from });

	if (ms === 0) return { duration: 0, easing: 'linear', at: () => 1 };

	const at = (progress: number) => ease((Math.min(Math.max(progress, 0), 1) * ms) / settled);

	return { duration: ms, easing: generateLinearEasing(at, ms), at };
}

export type Run = {
	animation: Animation;
	timing: Timing;
	from: number;
	to: number;
};

export type Running = { current: Run | null };

const FRAME = 16;

export function speedOf(run: Run): number {
	const { animation, timing, from, to } = run;
	if (timing.duration === 0) return 0;

	const now = Math.min(Number(animation.currentTime ?? 0), timing.duration);
	const before = Math.max(0, now - FRAME);
	if (now <= before) return 0;

	const moved = timing.at(now / timing.duration) - timing.at(before / timing.duration);
	return ((to - from) * moved * 1000) / (now - before);
}

export function interrupt(run: Running) {
	const current = run.current;
	run.current = null;
	if (current === null) return 0;

	const velocity = speedOf(current);
	current.animation.cancel();
	return velocity;
}

export function startGlide({
	run,
	element,
	frames,
	preset,
	slide,
	settle,
}: {
	run: Running;
	element: Element;
	frames: Keyframe[];
	preset: Transition;
	slide: Slide;
	settle?: () => void;
}) {
	const timing = toTiming({ preset, ...slide });
	const animation = glide({ element, keyframes: frames, timing });
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

export function glide({
	element,
	keyframes,
	timing,
}: {
	element: Element;
	keyframes: Keyframe[];
	timing: Timing;
}) {
	if (timing.duration === 0 || typeof element.animate !== 'function') return undefined;
	return element.animate(keyframes, { duration: timing.duration, easing: timing.easing });
}
