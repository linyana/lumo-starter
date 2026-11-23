export const HAIRLINE = 4;

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
	x: number;
	y: number;
	fit: ({ size, edge }: { size: number; edge: number }) => number;
};

export function frameOf(style: CSSStyleDeclaration): Frame {
	const edges = frame(style);
	return {
		...edges,
		fit: ({ size, edge }) => (style.boxSizing === 'border-box' ? size : size - edge),
	};
}

export type Scale = { x: number; y: number };

function ratio({ screen, layout }: { screen: number; layout: number }) {
	return layout > 0 && screen > 0 ? screen / layout : 1;
}

export function scaleOf({
	element,
	style,
	rect,
}: {
	element: HTMLElement;
	style: CSSStyleDeclaration;
	rect: DOMRect;
}): Scale {
	const edges = frame(style);
	const width = length(style.width);
	const height = length(style.height);
	const borderBox = width === undefined || height === undefined || style.boxSizing === 'border-box';

	return {
		x: ratio({
			screen: rect.width,
			layout: width === undefined ? element.offsetWidth : borderBox ? width : width + edges.x,
		}),
		y: ratio({
			screen: rect.height,
			layout: height === undefined ? element.offsetHeight : borderBox ? height : height + edges.y,
		}),
	};
}
