import { Button as BaseButton } from '@base-ui/react/button';
import type { ComponentProps, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { Spinner } from '@/components/feedback/spinner';
import { iconSlot, stateLayer } from '@/lib/control';
import { cn } from '@/lib/utils';

export const buttonVariants = tv({
	base: [
		'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
		'relative rounded-md font-medium select-none',
		'transition-[color,background-color,border-color,translate]',
		'ease-(--ease-spring) duration-(--duration-state)',
		'active:not-data-disabled:not-aria-[haspopup]:translate-y-(--press-offset)',
		'active:not-data-disabled:not-aria-[haspopup]:duration-(--duration-press)',
		stateLayer,
		'data-pressed:after:opacity-(--state-layer-hover-opacity)',
		'data-popup-open:after:opacity-(--state-layer-hover-opacity)',
		'disabled:pointer-events-none',
		'data-disabled:not-data-loading:opacity-50',
		'data-disabled:not-data-loading:cursor-not-allowed',
		'data-loading:cursor-progress',
		iconSlot,
		'cursor-pointer',
	],
	variants: {
		variant: {
			default: 'bg-primary text-primary-foreground',
			secondary: 'bg-secondary text-secondary-foreground',
			outline: 'border bg-background',
			ghost: 'bg-transparent',
			link: 'text-primary underline-offset-4 hover:underline after:hidden',
		},
		size: {
			sm: 'min-h-8 gap-1.5 px-3 text-sm',
			md: 'min-h-9 px-4 text-sm',
			lg: 'min-h-10 px-6 text-base',
			icon: 'size-8 text-sm',
		},
		tone: {
			default: '',
			destructive: '',
		},
	},
	compoundVariants: [
		{
			variant: 'default',
			class: [
				'[--state-layer-hover-opacity:var(--state-layer-fill-hover-opacity)]',
				'[--state-layer-pressed-opacity:var(--state-layer-fill-pressed-opacity)]',
			],
		},
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

export type ButtonProps = Omit<ComponentProps<typeof BaseButton>, 'className'> &
	VariantProps<typeof buttonVariants> & {
		className?: string;
		icon?: ReactNode;
		loadingIcon?: ReactNode;
		loading?: boolean;
	};

export function Button({
	className,
	variant = 'default',
	size = 'md',
	tone = 'default',
	icon = null,
	loadingIcon,
	loading = false,
	type = 'button',
	disabled = false,
	children,
	...props
}: ButtonProps) {
	const spinner = loadingIcon ?? <Spinner size={1} label={null} />;

	return (
		<BaseButton
			data-slot="button"
			type={type}
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
