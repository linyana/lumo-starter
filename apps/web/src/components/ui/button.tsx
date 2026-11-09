import { Button as BaseButton } from '@base-ui/react/button';
import type { ComponentProps, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { Spinner } from '@/components/ui/spinner';
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
		variant: {
			default: 'bg-primary text-primary-foreground',
			secondary: 'bg-secondary text-secondary-foreground',
			outline: 'border bg-background',
			ghost: 'bg-transparent',
			destructive: 'bg-destructive text-destructive-foreground',
			link: 'text-primary underline-offset-4 hover:underline after:hidden',
		},
		size: {
			sm: 'h-8 gap-1.5 px-3 text-sm',
			md: 'h-9 px-4 text-sm',
			lg: 'h-10 px-6 text-base',
			icon: 'size-9 text-sm',
		},
	},
	compoundVariants: [
		{
			variant: ['default', 'destructive'],
			class: [
				'[--state-layer-hover-opacity:var(--state-layer-fill-hover-opacity)]',
				'[--state-layer-pressed-opacity:var(--state-layer-fill-pressed-opacity)]',
			],
		},
	],
	defaultVariants: {
		variant: 'default',
		size: 'md',
	},
});

export type ButtonProps = Omit<ComponentProps<typeof BaseButton>, 'className'> &
	VariantProps<typeof buttonVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
		/** Leading graphic. While `loading` the spinner takes this slot. */
		icon?: ReactNode;
		/** Custom spinner, defaults to the built-in one. */
		loadingIcon?: ReactNode;
		loading?: boolean;
	};

export function Button({
	className,
	variant = 'default',
	size = 'md',
	icon = null,
	loadingIcon,
	loading = false,
	disabled = false,
	children,
	...props
}: ButtonProps) {
	const spinner = loadingIcon ?? <Spinner label={null} />;

	return (
		<BaseButton
			data-slot="button"
			data-variant={variant}
			data-size={size}
			data-loading={loading ? '' : undefined}
			aria-busy={loading || undefined}
			disabled={disabled || loading}
			focusableWhenDisabled={loading || undefined}
			className={cn(buttonVariants({ variant, size }), className)}
			{...props}
		>
			{icon ? (
				<>
					{loading ? spinner : icon}
					{children}
				</>
			) : (
				<span data-slot="button-content" className="grid">
					<span className={cn('col-start-1 row-start-1', loading && 'opacity-0')}>
						{children}
					</span>
					{loading && (
						<span className="col-start-1 row-start-1 flex place-self-center">
							{spinner}
						</span>
					)}
				</span>
			)}
		</BaseButton>
	);
}
