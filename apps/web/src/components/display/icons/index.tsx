import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * The filled glyphs we draw ourselves, because lucide only ships outlines: a filled icon is a disc
 * with its glyph knocked out, so it reads as a state — chosen, success, failure — where a stroke
 * icon reads as an action.
 *
 * An entry is one path in the 24-unit box lucide draws in: the disc first, then the glyph as
 * subpaths inside it. `evenodd` is what turns those subpaths into holes, so every hole has to be
 * traced once — the glyph whose strokes cross is written as a single traced outline, not as two.
 * Adding an icon is one line here.
 */
const paths = {
	'circle-check':
		'M12 2a10 10 0 0 0 0 20a10 10 0 0 0 0-20zM15.293 8.293a1 1 0 0 1 1.414 0a1 1 0 0 1 0 1.414L11.207 15.207a1 1 0 0 1-1.414 0L7.293 12.707a1 1 0 0 1 0-1.414a1 1 0 0 1 1.414 0L10.5 13.086z',
	'circle-exclamation':
		'M12 2a10 10 0 0 0 0 20a10 10 0 0 0 0-20zM11 8a1 1 0 0 1 2 0v4a1 1 0 0 1-2 0zM12 15a1 1 0 0 1 0 2a1 1 0 0 1 0-2z',
	'circle-x':
		'M12 2a10 10 0 0 0 0 20a10 10 0 0 0 0-20zM12 10.586 14.293 8.293a1 1 0 0 1 1.414 0a1 1 0 0 1 0 1.414L13.414 12l2.293 2.293a1 1 0 0 1 0 1.414a1 1 0 0 1-1.414 0L12 13.414l-2.293 2.293a1 1 0 0 1-1.414 0a1 1 0 0 1 0-1.414L10.586 12 8.293 9.707a1 1 0 0 1 0-1.414a1 1 0 0 1 1.414 0z',
} as const;

export type FillIconName = keyof typeof paths;

/** `name` picks the glyph; everything else is the `svg` element's own attributes. */
export type FillIconProps = ComponentProps<'svg'> & { name: FillIconName };

/**
 * Draws one filled glyph. `fill` is `currentColor`, so it takes the colour of the text it sits in,
 * and `className` sizes it: the box is lucide's, so a filled icon lines up with a stroke icon.
 *
 * `align-middle` is the one alignment the box can decide for itself: inline beside a word, the glyph
 * centres on the line instead of hanging off the baseline, and the rule costs nothing where a flex
 * or grid parent does the centring. `shrink-0` keeps a tight row from squeezing the box, which would
 * letterbox the glyph inside it rather than just drawing it smaller.
 *
 * `aria-hidden` is the default because an icon beside a label is decoration; a caller that draws one
 * alone overrides it with `aria-hidden={false}` and an `aria-label`.
 *
 * One module holds every glyph, which is the trade a `name` makes against a component per icon: one
 * import, but a bundle carries every path whether it draws it or not. At a few hundred bytes each
 * that is not worth splitting yet; if the set reaches dozens, a component per icon is what lets the
 * bundler drop the rest.
 */
export function FillIcon({ name, className, ...props }: FillIconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={24}
			height={24}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
			className={cn('align-middle shrink-0', className)}
			{...props}
		>
			<path fillRule="evenodd" d={paths[name]} />
		</svg>
	);
}
