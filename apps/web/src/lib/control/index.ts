import { cn } from '@/lib/utils';

export const stateLayer = cn(
	'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]',
	'after:bg-current after:opacity-0 after:transition-opacity',
	'after:duration-(--duration-state)',
	'hover:not-data-disabled:after:opacity-(--state-layer-hover-opacity)',
	'active:not-data-disabled:after:opacity-(--state-layer-pressed-opacity)',
);

export const pressable = cn(
	'pressed:translate-y-(--press-offset)',
	'pressed:scale-(--press-scale)',
	'pressed:duration-(--duration-press)',
	'pressed:ease-in-out',
);

export const iconSlot = '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-[1em]';

export const fieldText = {
	sm: 'text-sm',
	md: 'text-sm',
	lg: 'text-base',
} as const;

export const clearButton = cn(
	'relative flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-sm',
	'text-muted-foreground transition-colors duration-(--duration-state)',
	'active:text-foreground',
	'disabled:pointer-events-none disabled:opacity-50',
	'data-disabled:pointer-events-none data-disabled:opacity-50',
	iconSlot,
	stateLayer,
);

const shellFocus = cn(
	'[--shell-focus:var(--input-strong)]',
	'focus-visible:border-(--shell-focus) focus-visible:outline-none',
	'failed:border-destructive',
	'failed:[--shell-hover:var(--destructive-soft)]',
	'failed:[--shell-focus:var(--destructive)]',
);

const shellEdge = cn(
	'[--shell-hover:var(--input-strong)]',
	'hover:not-focus-visible:not-disabled:not-data-disabled:border-(--shell-hover)',
	shellFocus,
);

export const fieldShell = ({ hover = 'border' }: { hover?: 'border' | 'tint' } = {}) =>
	cn(
		'w-full min-w-0 rounded-md border border-input bg-background text-foreground',
		'dark:border-border dark:bg-card',
		'placeholder:text-muted-foreground',
		'transition-colors duration-(--duration-state)',
		hover === 'border' ? shellEdge : shellFocus,
		'disabled:cursor-not-allowed disabled:opacity-50',
		'data-disabled:cursor-not-allowed data-disabled:opacity-50',
		'data-loading:cursor-progress',
		'data-loading:disabled:opacity-100 data-loading:data-disabled:opacity-100',
	);

export const toggleBox = cn(
	'inline-flex size-4 shrink-0 cursor-pointer items-center justify-center align-middle',
	'border border-input bg-background',
	'transition-[color,background-color,border-color] duration-(--duration-state)',
	shellEdge,
	'data-checked:border-primary',
	'data-checked:focus-visible:border-(--shell-focus)',
	'data-disabled:cursor-not-allowed data-disabled:opacity-50',
	'data-loading:cursor-progress',
	'data-loading:data-disabled:opacity-100',
);

export const toggleMark = cn(
	'transition-[scale,opacity] duration-(--duration-state) ease-(--ease-spring)',
	'data-starting-style:opacity-0 data-ending-style:opacity-0',
);

export const caret = cn(
	'size-[1em] shrink-0',
	'transition-transform duration-(--duration-turn) ease-(--ease-overlay)',
	'group-data-panel-open:rotate-90',
);

export const row = cn(
	'flex py-2 pl-4 text-sm leading-4 outline-none select-none',
	'data-disabled:cursor-not-allowed data-disabled:opacity-50',
	'relative z-0',
	"before:absolute before:inset-x-1 before:inset-y-px before:z-[-1] before:rounded-md before:content-['']",
	'before:bg-current before:opacity-0',
	'data-highlighted:text-accent-foreground',
	'data-highlighted:before:opacity-(--state-layer-hover-opacity)',
	'data-selected:before:opacity-(--state-layer-hover-opacity)',
	'data-selected:data-highlighted:before:opacity-(--state-layer-selected-hover-opacity)',
);

export const rowDestructive = 'text-destructive data-highlighted:text-destructive';

export type RowTone = 'default' | 'destructive';

export const rowGroupLabel = 'px-4 py-2 text-sm leading-4 text-muted-foreground select-none';

export const rowSeparator = 'mx-1 my-1 h-px bg-border';
