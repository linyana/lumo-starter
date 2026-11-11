import { Toggle as BaseToggle, type ToggleProps as BaseToggleProps } from '@base-ui/react/toggle';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { iconSlot, stateLayer } from '@/lib/control';

/** The two tiers: one that is only there once it is on, and one that is drawn either way. */
export type ToggleVariant = 'ghost' | 'outline';
export type ToggleSize = 'sm' | 'md' | 'lg' | 'icon';

/**
 * A control that stays where it was put — one setting spelled as a control, not an action.
 *
 * Being on is the tint the pointer leaves, kept: arriving is a hover, and staying is that same tint
 * made lasting. So the surface never changes colour between the two states, the layer over it does,
 * and a toggle that is both on and pointed at takes the one step between hover and press rather than
 * going still. There is no downward nudge on the press the way `LumoButton` has one: a toggle has
 * already answered the press by staying pressed, and answering twice would read as unsure.
 */
export const toggleVariants = tv({
	base: [
		'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap',
		'relative rounded-md font-medium select-none',
		'transition-[color,background-color,border-color]',
		'ease-(--ease-spring) duration-(--duration-state)',
		stateLayer,
		'data-pressed:after:opacity-(--state-layer-hover-opacity)',
		'data-pressed:hover:after:opacity-(--state-layer-selected-hover-opacity)',
		'data-pressed:active:after:opacity-(--state-layer-pressed-opacity)',
		'data-disabled:pointer-events-none data-disabled:opacity-50',
		iconSlot,
	],
	variants: {
		variant: {
			ghost: 'bg-transparent',
			outline: 'border bg-background',
		},
		size: {
			sm: 'h-8 gap-1.5 px-3 text-sm',
			md: 'h-9 px-4 text-sm',
			lg: 'h-10 px-6 text-base',
			icon: 'size-9 text-sm',
		},
	},
	defaultVariants: {
		variant: 'ghost',
		size: 'md',
	},
});

export type LumoToggleProps<Value extends string = string> = Omit<
	BaseToggleProps<Value>,
	'className'
> &
	VariantProps<typeof toggleVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
	};

/**
 * A button with a memory. Inside a `ToggleGroup` the group reads and writes the state instead, which
 * is why the value it is known by there is passed as `value`; on its own it is `pressed`.
 */
export function LumoToggle<Value extends string>({
	className,
	variant = 'ghost',
	size = 'md',
	...props
}: LumoToggleProps<Value>) {
	return (
		<BaseToggle
			data-slot="toggle"
			data-variant={variant}
			data-size={size}
			className={cn(toggleVariants({ variant, size }), className)}
			{...props}
		/>
	);
}
