/**
 * The appearance every floating surface shares.
 *
 * A dialog, a drawer, a menu, a popover and a tooltip are drawn by Base UI parts of their own, but
 * the layer they sit on, the way they arrive, the arrow they point with and the viewport they slide
 * between are the same mechanics five times over. Resolved here once, they cannot drift apart: a
 * popover and a tooltip open on the same beat, and one fixed place to change the ladder.
 *
 * The classes are already merged through `cn()`, so a component that hands `className` in last
 * still wins — these are a starting point, not a lock.
 *
 * The layer ladder, which is the one thing a portal cannot work out on its own. Two overlays at the
 * same z-index are ordered by whichever portal mounted last, so every step is written down:
 *
 *   10 — chrome that stays above the page it moves over: a sticky header, a scrollbar, a swipe strip
 *   30 — a bar that floats over the page it acts on: a chosen set, an unsaved form
 *   40 — a scrim
 *   50 — the popup the scrim belongs to: dialog, drawer, menu, popover
 *   60 — a tooltip, which explains something inside one of those
 *   70 — a toast, which is true whatever else is open
 */
import { cn } from '@/lib/utils';

/** The scrim behind a modal surface. */
export const backdrop = cn(
	'fixed inset-0 z-40 min-h-dvh bg-(--overlay) transition-opacity',
	'duration-(--duration-state) ease-(--ease-overlay)',
	// iOS 26+: a fixed backdrop falls short of the visible viewport while scrolling.
	'supports-[-webkit-touch-callout:none]:absolute',
	'data-starting-style:opacity-0 data-ending-style:opacity-0',
);

/**
 * The box a modal surface is drawn in. Base UI builds an alert dialog out of a dialog, so the two
 * are the same panel with a different role on it, and writing it twice would put the padding, the
 * radius and the cap in two places that can drift apart.
 *
 * The panel caps itself at the viewport — the 2rem is the layer's own p-4 — and scrolls inside, so
 * a long form never grows past a centred grid where its top would be lost.
 */
export const panel = cn(
	'w-full max-w-md rounded-xl border bg-popover p-6 text-popover-foreground shadow-overlay',
	'max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain',
	'transition-[scale,opacity] duration-(--duration-state) ease-(--ease-overlay)',
	'data-starting-style:scale-95 data-starting-style:opacity-0',
	'data-ending-style:scale-95 data-ending-style:opacity-0',
);

/**
 * The fixed layer a modal panel is centred in. `safe` keeps a popup taller than the viewport — one
 * that brought its own max-height — starting at the top edge instead of overflowing above it,
 * where nothing can scroll.
 */
export const modalViewport = cn(
	'fixed inset-0 z-50 grid place-items-center-safe overflow-y-auto p-4',
);

/**
 * A popup arriving and leaving: it scales from wherever Base UI anchored it, and its box is the size
 * of the Viewport inside it while one slides to the next — which is a box the popup does not
 * otherwise have, so the two dimensions are named rather than measured.
 */
export const popup = cn(
	'origin-(--transform-origin)',
	'h-(--popup-height,auto) w-(--popup-width,auto)',
	'transition-[width,height,opacity,scale]',
	'duration-(--duration-overlay) ease-(--ease-overlay)',
	'data-starting-style:scale-90 data-starting-style:opacity-0',
	'data-ending-style:scale-90 data-ending-style:opacity-0',
	'data-instant:transition-none',
);

/** The box a popup is placed in. It follows the popup rather than jumping when the popup resizes. */
export const positioner = cn(
	'max-w-(--available-width)',
	'h-(--positioner-height,auto) w-(--positioner-width,auto)',
	'transition-[top,left,right,bottom,transform]',
	'duration-(--duration-overlay) ease-(--ease-overlay)',
	'data-instant:transition-none',
);

/**
 * A viewport sliding one panel out and the next one in. Base UI marks the panel arriving as
 * `data-current` and the one leaving as `data-previous`, and reports which way the change went, so
 * the whole track is drawn from here instead of once per overlay that has one.
 *
 * The inline padding is the caller's, because it is the popup's own inset: set
 * `--viewport-inline-padding` on the same element.
 */
export const viewport = cn(
	'relative h-full w-full overflow-clip px-(--viewport-inline-padding)',
	'[&_:is([data-current],[data-previous])]:w-[calc(var(--popup-width)-2*var(--viewport-inline-padding))]',
	'[&_:is([data-current],[data-previous])]:translate-x-0',
	'[&_:is([data-current],[data-previous])]:opacity-100',
	'[&_:is([data-current],[data-previous])]:transition-[translate,opacity]',
	'[&_:is([data-current],[data-previous])]:duration-[var(--duration-overlay),calc(var(--duration-overlay)/2)]',
	'[&_:is([data-current],[data-previous])]:ease-(--ease-overlay)',
	'[[data-instant]_&_:is([data-current],[data-previous])]:transition-none',
	"data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:-translate-x-1/2",
	"data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:opacity-0",
	"data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:translate-x-1/2",
	"data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:opacity-0",
	"data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:translate-x-1/2",
	"data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:opacity-0",
	"data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:-translate-x-1/2",
	"data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:opacity-0",
);

/**
 * An arrow's shape and travel: Base UI places it on the anchor's axis, and which edge it hangs off
 * is worked out from the side the popup landed on. The square that makes the point is a 6px box
 * turned 45°, clipped to its upper half, so it carries the popup's own border and fill and the
 * outline reads as one shape — the fill itself is the caller's, since it depends on the surface.
 */
export const arrow = cn(
	'block h-1.5 w-3 overflow-clip',
	'transition-[left,top] duration-(--duration-overlay) ease-(--ease-overlay)',
	'data-instant:transition-none',
	'data-[side=bottom]:-top-1.5 data-[side=top]:-bottom-1.5 data-[side=top]:rotate-180',
	'data-[side=left]:-right-2.25 data-[side=left]:rotate-90',
	'data-[side=right]:-left-2.25 data-[side=right]:-rotate-90',
	'before:absolute before:bottom-0 before:left-1/2 before:size-[calc(6px*sqrt(2))]',
	'before:-translate-x-1/2 before:translate-y-1/2 before:rotate-45',
);

/**
 * The heading of an overlay, and the line under it. One size for all of them, so a popover opened
 * inside a dialog does not read as a smaller kind of thing. A toast is not one of these: it is a
 * message rather than a surface, and it says so with its own, quieter type.
 */
export const title = 'text-base font-semibold';

export const description = 'mt-1.5 text-sm text-muted-foreground';
