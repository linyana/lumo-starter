import { Button as BaseButton } from '@base-ui/react/button';
import type { ComponentProps, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { LumoSpinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { iconSlot, stateLayer } from '@/lib/control';

/** Reference component — other components follow this shape. */
export const buttonVariants = tv({
	base: [
		'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
		'relative rounded-md font-medium select-none',
		'transition-[color,background-color,border-color,translate]',
		'ease-(--ease-spring) duration-(--duration-state)',
		'active:not-aria-[haspopup]:translate-y-(--press-offset)',
		'active:not-aria-[haspopup]:duration-(--duration-press)',
		stateLayer,
		'data-pressed:after:opacity-(--state-layer-hover-opacity)',
		'data-disabled:pointer-events-none',
		'data-disabled:not-data-loading:opacity-50',
		iconSlot,
		'cursor-pointer',
	],
	variants: {
		// How loud the button is. It says nothing about what the button does, which is the other
		// axis below: a ghost action and a filled one can both be the dangerous one.
		variant: {
			default: 'bg-primary text-primary-foreground',
			secondary: 'bg-secondary text-secondary-foreground',
			outline: 'border bg-background',
			ghost: 'bg-transparent',
			link: 'text-primary underline-offset-4 hover:underline after:hidden',
		},
		size: {
			// A height is a floor, not a ceiling: one line of text still lands on the 32/36/40 step,
			// but a label that carries two lines — the account menu at the foot of the rail — grows
			// the button instead of spilling out of a box that was told how tall to be. The icon
			// button is a square drawn around a glyph and nothing more, so it stays fixed — and it
			// sits on the `sm` step's 32, which is the square a compact row and a narrow rail draw,
			// so an icon button never outgrows the box it was put in.
			sm: 'min-h-8 gap-1.5 px-3 text-sm',
			md: 'min-h-9 px-4 text-sm',
			lg: 'min-h-10 px-6 text-base',
			icon: 'size-8 text-sm',
		},
		/** What the button does, drawn in the colour of a consequence. Orthogonal to `variant`. */
		tone: {
			default: '',
			destructive: '',
		},
	},
	compoundVariants: [
		// A block of colour takes the stronger tint: ink on a fill needs more of the tint under it to
		// register than a quieter surface does, so only the loudest variant asks for it — in either
		// tone, because a red fill is a fill.
		{
			variant: 'default',
			class: [
				'[--state-layer-hover-opacity:var(--state-layer-fill-hover-opacity)]',
				'[--state-layer-pressed-opacity:var(--state-layer-fill-pressed-opacity)]',
			],
		},
		// `destructive` is one more colour for each thing a `variant` already says, not a sixth
		// variant: the fill turns red, the quiet fill turns a tint of red, the drawn box keeps its
		// edge and takes the red, and the two buttons that were only ever text become red text. The
		// state layer is `currentColor`, so a danger button is already tinted red by its own ink.
		{
			tone: 'destructive',
			variant: 'default',
			class: 'bg-destructive text-destructive-foreground',
		},
		{ tone: 'destructive', variant: 'secondary', class: 'bg-destructive/10 text-destructive' },
		{ tone: 'destructive', variant: 'outline', class: 'border-destructive text-destructive' },
		{ tone: 'destructive', variant: 'ghost', class: 'text-destructive' },
		{ tone: 'destructive', variant: 'link', class: 'text-destructive' },
	],
	defaultVariants: {
		variant: 'default',
		size: 'md',
		tone: 'default',
	},
});

export type LumoButtonProps = Omit<ComponentProps<typeof BaseButton>, 'className'> &
	VariantProps<typeof buttonVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
		/** Leading graphic. While `loading` the spinner takes this slot. */
		icon?: ReactNode;
		/** Custom spinner, defaults to the built-in one. */
		loadingIcon?: ReactNode;
		loading?: boolean;
	};

export function LumoButton({
	className,
	variant = 'default',
	size = 'md',
	tone = 'default',
	icon = null,
	loadingIcon,
	loading = false,
	disabled = false,
	children,
	...props
}: LumoButtonProps) {
	const spinner = loadingIcon ?? <LumoSpinner size={1} label={null} />;

	return (
		<BaseButton
			data-slot="button"
			data-variant={variant}
			data-tone={tone}
			data-size={size}
			data-loading={loading ? '' : undefined}
			aria-busy={loading || undefined}
			disabled={disabled || loading}
			focusableWhenDisabled={loading || undefined}
			className={cn(buttonVariants({ variant, size, tone }), className)}
			{...props}
		>
			{icon ? (
				<>
					{loading ? spinner : icon}
					{children}
				</>
			) : (
				// `w-full` is what lets a full-width button's width reach what is inside it: the grid
				// item would otherwise be shrink-to-fit, and a child's own `w-full` — a layout that
				// spreads its ends apart — would resolve against nothing and collapse to content.
				// Against an indefinite button it stays `auto`, so a button that hugs its label is
				// unchanged.
				<span data-slot="button-content" className="w-full grid">
					<span className={cn('col-start-1 row-start-1', loading && 'opacity-0')}>{children}</span>
					{loading && (
						<span className="col-start-1 row-start-1 flex place-self-center">{spinner}</span>
					)}
				</span>
			)}
		</BaseButton>
	);
}
