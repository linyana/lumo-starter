/**
 * The appearance every control shares.
 *
 * Five idioms repeat across the library — the tint a control shows while it is hovered or pressed,
 * the way an icon is sized from the text around it, the shell of a text field, the box a tick or a
 * dot is drawn in, and the row a list of choices is made of — plus the one glyph that is state rather
 * than decoration: the caret of a row that folds. Each is written once here, so a checkbox and a radio
 * look like one family, a press feels the same wherever it happens, and a menu's action and a select's
 * option are the same line.
 */
import { cn } from '@/lib/utils';

/**
 * Hover and press, drawn as a tint on top of the control's own fill rather than as a second
 * background: an `after` layer inheriting the radius, coloured by `currentColor`, so one rule covers
 * a primary button, an outlined row and a transparent trigger. The opacities are tokens, because
 * what reads as a tint under light text is not what reads under dark.
 */
export const stateLayer = cn(
	'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]',
	'after:bg-current after:opacity-0 after:transition-opacity',
	'after:duration-(--duration-state)',
	'hover:after:opacity-(--state-layer-hover-opacity)',
	'active:after:opacity-(--state-layer-pressed-opacity)',
);

/**
 * The icon slot. A glyph is given as a rendered element and takes its size from the text around it,
 * so a control on a larger scale grows its icons with it and a call site never passes a size. Every
 * glyph is decoration beside a word the control already says, so none of them take the pointer.
 */
export const iconSlot = '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-[1em]';

/**
 * The way out of a field that can be emptied: a cross, drawn as a ghost icon button so it carries the
 * same state layer every other quiet action does instead of a disc of its own. Where it sits is the
 * field's — an input gives it the end of its line, a textarea the top of its corner, a select the
 * room beside its caret — but what it looks like is this one line, so the three read as one family
 * and a field never has to draw a glyph of its own.
 */
export const clearButton = cn(
	'relative flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-sm',
	'text-muted-foreground transition-colors duration-(--duration-state)',
	'active:text-foreground',
	'disabled:pointer-events-none disabled:opacity-50',
	'data-disabled:pointer-events-none data-disabled:opacity-50',
	iconSlot,
	stateLayer,
);

/**
 * The shell of a text control — the input, and the textarea, which differ only in the element they
 * are drawn on and the shape of their size. Selection is not here: it is one rule in the theme,
 * because a reader expects the same colour wherever they drag across a page.
 *
 * Read-only is not here either, though it looks like it belongs: `:read-only` matches every element
 * that is not editable, a `<button>` and a `<div>` included, so the tint would follow a select's
 * trigger around for its whole life. Only a field that can be typed into and is being withheld — the
 * input, the textarea — puts it on, and a control with a state of its own spells that state instead.
 *
 * Pointed at, and reached by keyboard, are the same edge: both step the border to `--input-strong`,
 * and both leave the focus outline off. A field already says with its own box where the reader is
 * working, and an input takes focus on every click rather than only on a tab, so an outline around
 * that box would be drawn nearly all the time. The colour is the shell's own second step and not the
 * ring's, because a hover that was a colour and a focus that was a ring would make one field look
 * like two different states of attention.
 */
export const fieldShell = cn(
	'w-full min-w-0 rounded-md border border-input bg-background text-foreground',
	'dark:border-border dark:bg-card',
	'placeholder:text-muted-foreground',
	'transition-colors duration-(--duration-state)',
	'hover:not-disabled:not-data-disabled:border-input-strong',
	'focus-visible:border-input-strong focus-visible:outline-none',
	'disabled:cursor-not-allowed disabled:opacity-50',
	'data-disabled:cursor-not-allowed data-disabled:opacity-50',
	// Written by the field when the control fails validation; aria-invalid is the same fact for a form
	// that is not Base UI's. Both sit after the hover and focus rules above, so a field that is
	// wrong stays destructive while it is pointed at: the stronger thing it has to say wins.
	'data-invalid:border-destructive aria-invalid:border-destructive',
);

/**
 * The box a checkbox and a radio are drawn in: the same 16px square, the same invalid border, the
 * same disabled fade. What fills it once it is checked is theirs — a checkbox fills, a radio keeps
 * its ring and puts a dot in it — so only the part they agree on is here.
 */
export const toggleBox = cn(
	'inline-flex size-4 shrink-0 cursor-pointer items-center justify-center align-middle',
	'border border-input bg-background',
	'transition-[color,background-color,border-color] duration-(--duration-state)',
	// The same two states a field wears, on the box instead of the shell. Only focus moves the edge of
	// a box that is already checked: hover has nothing to add to "on", and a tick that greyed under a
	// passing cursor would read as being cleared.
	'hover:not-disabled:not-data-disabled:border-input-strong',
	'focus-visible:border-input-strong focus-visible:outline-none',
	'data-checked:border-primary',
	'data-checked:focus-visible:border-input-strong',
	'data-invalid:border-destructive',
	'data-disabled:cursor-not-allowed data-disabled:opacity-50',
);

/**
 * The glyph inside a toggle, arriving and leaving with the box. The distance it scales over is the
 * caller's: a tick is drawn at close to its own size, a dot grows from nothing.
 */
export const toggleMark = cn(
	'transition-[scale,opacity] duration-(--duration-state) ease-(--ease-spring)',
	'data-starting-style:opacity-0 data-ending-style:opacity-0',
);

/**
 * The caret of a row that folds. It reads the open state off its own row rather than being told, so a
 * caret and the panel under it cannot disagree about whether the panel is open: the row carries
 * `group`, and Base UI writes `data-panel-open` on the trigger of both a collapsible and an accordion
 * item — one attribute, one rule, one turn.
 */
export const caret = cn(
	'size-[1em] shrink-0',
	'transition-transform duration-(--duration-turn) ease-(--ease-overlay)',
	'group-data-panel-open:rotate-90',
);

/**
 * One row in a list of choices — a menu's action, a select's option. The fill is one `before` layer,
 * inset by the popup's own corner and rounded to match it, so a row changes colour rather than gaining
 * a box — and it is the row's own text colour at a state-layer opacity, not a colour of its own, so
 * the same three steps read on a menu, in a select and on a nav row. The tint is what the pointer or
 * the arrows leave. The row that is chosen wears that same tint: being chosen is what the pointer was
 * already saying, so it is not a louder thing, only a lasting one. It deepens a notch while the
 * pointer or the arrows are still on it, so a row that is both does not go still. The padding on the
 * right is the caller's: a row that carries an action of its own needs more room.
 */
export const row = cn(
	'flex py-2 pl-4 text-sm leading-4 outline-none select-none',
	'relative z-0',
	"before:absolute before:inset-x-1 before:inset-y-0 before:z-[-1] before:rounded-sm before:content-['']",
	'before:bg-current before:opacity-0',
	'data-highlighted:text-accent-foreground',
	'data-highlighted:before:opacity-(--state-layer-hover-opacity)',
	'data-selected:before:opacity-(--state-layer-hover-opacity)',
	'data-selected:data-highlighted:before:opacity-(--state-layer-selected-hover-opacity)',
);

/**
 * A row that destroys rather than acts or navigates. A row's tint is its own text colour, so the ink
 * is the whole of the appearance — and it has to outlast the highlight, which would otherwise step
 * the row back to the ordinary accent while the pointer is still on it.
 */
export const rowDestructive = 'text-destructive data-highlighted:text-destructive';

/**
 * What a row does, drawn in the colour of a consequence. Orthogonal to the row itself, the way a
 * button's `tone` is to its `variant`: an ordinary action and a destroying one are the same row.
 */
export type RowTone = 'default' | 'destructive';

/** The name over a group of rows: quieter than the rows, and never one of them. */
export const rowGroupLabel = 'px-4 py-2 text-sm leading-4 text-muted-foreground select-none';

/** The line between two groups of rows. */
export const rowSeparator = 'mx-1 my-1 h-px bg-border';
