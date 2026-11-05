/**
 * Measurement helpers for the boxes that glide.
 *
 * A style is written in CSS pixels; `getBoundingClientRect` reports screen pixels. An ancestor's
 * `transform` or a CSS `zoom` puts a factor between the two, and anything measured for the first
 * and written as the second has to be converted — otherwise a glide inside a scaled container
 * lands at its own size times the scale.
 */

/**
 * Below this many pixels a change is not worth a glide. A spring covers the same time whatever the
 * distance, so a 2px settle would take half a second to arrive and read as lag rather than motion.
 * Shared, because every box that glides has to agree on what counts as having moved.
 */
export const HAIRLINE = 4;

/** A length the browser resolved, or `undefined` when it is a keyword (`auto`, `none`). */
function length(value: string) {
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

function frame(style: CSSStyleDeclaration) {
	const px = (value: string) => length(value) ?? 0;
	return {
		x:
			px(style.paddingLeft) +
			px(style.paddingRight) +
			px(style.borderLeftWidth) +
			px(style.borderRightWidth),
		y:
			px(style.paddingTop) +
			px(style.paddingBottom) +
			px(style.borderTopWidth) +
			px(style.borderBottomWidth),
	};
}

export type Frame = {
	/** What padding and borders add sideways. */
	x: number;
	/** The same, vertically. */
	y: number;
	/**
	 * The inline size that makes the border box the size given, whatever `box-sizing` says — a
	 * height reaches the animated box's border box, its content is inside a frame.
	 */
	fit: (size: number, edge: number) => number;
};

/** Border and padding of `style`: what a box is bigger than the content it holds. */
export function frameOf(style: CSSStyleDeclaration): Frame {
	const edges = frame(style);
	return {
		...edges,
		fit: (size, edge) => (style.boxSizing === 'border-box' ? size : size - edge),
	};
}

export type Scale = { x: number; y: number };

function ratio(screen: number, layout: number) {
	return layout > 0 && screen > 0 ? screen / layout : 1;
}

/**
 * Screen pixels per CSS pixel at `element`, measured against the size it was laid out with. The
 * style's own width is the precise number — `offsetWidth` is rounded — and both fall back to the
 * offsets when the size is a keyword.
 */
export function scaleOf(element: HTMLElement, style: CSSStyleDeclaration, rect: DOMRect): Scale {
	const edges = frame(style);
	const width = length(style.width);
	const height = length(style.height);
	const borderBox =
		width === undefined || height === undefined || style.boxSizing === 'border-box';

	return {
		x: ratio(
			rect.width,
			width === undefined ? element.offsetWidth : borderBox ? width : width + edges.x,
		),
		y: ratio(
			rect.height,
			height === undefined ? element.offsetHeight : borderBox ? height : height + edges.y,
		),
	};
}
