import { cn } from '@/lib/utils';

export const backdrop = cn(
	'fixed inset-0 z-40 min-h-dvh bg-(--overlay) transition-opacity',
	'duration-(--duration-modal) ease-out',
	'supports-[-webkit-touch-callout:none]:absolute',
	'starting:opacity-0 data-starting-style:opacity-0 data-ending-style:opacity-0',
);

export const panel = cn(
	'w-full max-w-md rounded-xl border bg-popover p-6 text-popover-foreground shadow-overlay',
	'max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain',
	'transform-gpu transition-[scale,opacity] duration-(--duration-modal) ease-(--ease-spring)',
	'data-starting-style:scale-95 data-starting-style:opacity-0',
	'starting:scale-95 starting:opacity-0',
	'data-ending-style:scale-95 data-ending-style:opacity-0',
	'data-ending-style:duration-(--duration-modal-exit) data-ending-style:ease-out',
	'data-nested-dialog-open:scale-95 data-nested-dialog-open:opacity-0',
);

export const modalViewport = cn(
	'fixed inset-0 z-50 grid place-items-center-safe overflow-y-auto p-4',
);

export const popup = cn(
	'origin-(--transform-origin)',
	'h-(--popup-height,auto) w-(--popup-width,auto)',
	'transition-[width,height,opacity,scale]',
	'duration-(--duration-overlay) ease-(--ease-overlay)',
	'data-starting-style:scale-90 data-starting-style:opacity-0',
	'data-ending-style:scale-90 data-ending-style:opacity-0',
	'data-instant:transition-none',
);

export const positioner = cn(
	'max-w-(--available-width)',
	'h-(--positioner-height,auto) w-(--positioner-width,auto)',
	'transition-[top,left,right,bottom,transform]',
	'duration-(--duration-overlay) ease-(--ease-overlay)',
	'data-instant:transition-none',
);

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

export const title = 'text-base font-semibold';

export const description = 'mt-1.5 text-sm text-muted-foreground';
