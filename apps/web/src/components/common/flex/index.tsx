import { useRender } from '@base-ui/react/use-render';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';

/**
 * One row of layout, as the six decisions a flex container makes: how its children are ordered,
 * where they sit across that line, where they sit along it, whether they may fall onto a second
 * line, how far apart they are, and whether the box takes the whole line or only what is in it.
 *
 * The props are the container's own and nothing more: what a child does with the space left over
 * — grow, shrink, wrap its text — is the child's className, because a flex parent that also
 * decided its children's size would have to grow a prop for every one of them. Spacing is a set
 * of steps rather than a number so a layout cannot invent a gap the rest of the library does not
 * know, and `gap` has no default: a call site that wants air says so.
 *
 * Defaults are CSS's own, so a plain `<Flex>` is a plain `display: flex` and the data attributes
 * below can be read as "this is what the browser is already doing".
 */
export const flexVariants = tv({
	variants: {
		/** The box takes the whole line, or only what its children need. */
		display: {
			flex: 'flex',
			inline: 'inline-flex',
		},
		direction: {
			row: 'flex-row',
			column: 'flex-col',
			'row-reverse': 'flex-row-reverse',
			'column-reverse': 'flex-col-reverse',
		},
		/** Across the line: the items' own axis — a row's height, a column's width. */
		align: {
			start: 'items-start',
			center: 'items-center',
			end: 'items-end',
			baseline: 'items-baseline',
			stretch: 'items-stretch',
		},
		/** Along the line: where the children start, and what happens to the slack between them. */
		justify: {
			start: 'justify-start',
			center: 'justify-center',
			end: 'justify-end',
			between: 'justify-between',
			around: 'justify-around',
			evenly: 'justify-evenly',
		},
		wrap: {
			nowrap: 'flex-nowrap',
			wrap: 'flex-wrap',
			'wrap-reverse': 'flex-wrap-reverse',
		},
		gap: {
			none: 'gap-0',
			xs: 'gap-1',
			sm: 'gap-2',
			md: 'gap-3',
			lg: 'gap-4',
			xl: 'gap-6',
		},
	},
	defaultVariants: {
		display: 'flex',
		direction: 'row',
		align: 'stretch',
		justify: 'start',
		wrap: 'nowrap',
	},
});

export type FlexProps = useRender.ComponentProps<'div'> & VariantProps<typeof flexVariants>;

export function Flex({
	className,
	ref,
	render,
	display = 'flex',
	direction = 'row',
	align = 'stretch',
	justify = 'start',
	wrap = 'nowrap',
	gap,
	...props
}: FlexProps) {
	const element = useRender({
		render,
		ref,
		defaultTagName: 'div',
		props: {
			...props,
			'data-slot': 'flex',
			'data-display': display,
			'data-direction': direction,
			'data-align': align,
			'data-justify': justify,
			'data-wrap': wrap,
			'data-gap': gap ?? undefined,
			className: cn(flexVariants({ display, direction, align, justify, wrap, gap }), className),
		},
	});

	return element;
}
