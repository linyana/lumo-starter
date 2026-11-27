import { Button as BaseButton } from '@base-ui/react/button';
import type { ComponentProps, ReactNode } from 'react';
import { tv } from 'tailwind-variants';
import { Spinner } from '@/components/ui/feedback/spinner';
import {
	controlBox,
	controlMinHeight,
	fieldText,
	iconSlot,
	pressable,
	stateLayer,
} from '@/lib/control';
import { cn } from '@/lib/utils';

const LOOK = {
	primary: { variant: 'default', color: 'neutral' },
	default: { variant: 'default', color: 'neutral' },
	destructive: { variant: 'default', color: 'destructive' },
} as const;

export const buttonVariants = tv({
	base: [
		'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
		'relative rounded-md font-medium select-none',
		'transition-[color,background-color,border-color,translate,scale]',
		'ease-(--ease-spring) duration-(--duration-state)',
		pressable,
		stateLayer,
		'data-pressed:after:opacity-(--state-layer-hover-opacity)',
		'data-popup-open:after:opacity-(--state-layer-hover-opacity)',
		'disabled:pointer-events-none',
		'data-disabled:not-data-loading:opacity-50',
		'data-disabled:not-data-loading:cursor-not-allowed',
		'data-loading:cursor-progress',
		iconSlot,
		"[&_svg:not([class*='stroke-'])]:stroke-[1.85]",
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
			default: `${controlMinHeight.md} px-4 ${fieldText.md} has-data-[icon=start]:ps-3 has-data-[icon=end]:pe-3`,
			md: `${controlMinHeight.md} px-4 ${fieldText.md} has-data-[icon=start]:ps-3 has-data-[icon=end]:pe-3`,
			xs: `${controlMinHeight.xs} gap-1 px-2 ${fieldText.xs} has-data-[icon=start]:ps-1.5 has-data-[icon=end]:pe-1.5`,
			sm: `${controlMinHeight.sm} gap-1.5 px-3 ${fieldText.sm} has-data-[icon=start]:ps-2 has-data-[icon=end]:pe-2`,
			lg: `${controlMinHeight.lg} px-6 ${fieldText.lg} has-data-[icon=start]:ps-5 has-data-[icon=end]:pe-5`,
			icon: `${controlBox.md} ${fieldText.md}`,
			'icon-md': `${controlBox.md} ${fieldText.md}`,
			'icon-xs': `${controlBox.xs} ${fieldText.xs}`,
			'icon-sm': `${controlBox.sm} ${fieldText.sm}`,
			'icon-lg': `${controlBox.lg} ${fieldText.lg}`,
		},
		color: {
			neutral: '',
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
			color: 'destructive',
			variant: 'default',
			class: 'bg-destructive text-destructive-foreground',
		},
		{
			color: 'destructive',
			variant: 'secondary',
			class: 'bg-destructive/10 text-destructive',
		},
		{ color: 'destructive', variant: 'outline', class: 'border-destructive text-destructive' },
		{ color: 'destructive', variant: 'ghost', class: 'text-destructive' },
		{ color: 'destructive', variant: 'link', class: 'text-destructive' },
	],
	defaultVariants: {
		variant: 'default',
		size: 'md',
		color: 'neutral',
	},
});

export type ButtonProps = Omit<ComponentProps<typeof BaseButton>, 'className'> & {
	className?: string;
	icon?: ReactNode;
	loadingIcon?: ReactNode;
	loading?: boolean;
	variant?: 'primary' | 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
	size?:
		| 'default'
		| 'xs'
		| 'sm'
		| 'md'
		| 'lg'
		| 'icon'
		| 'icon-xs'
		| 'icon-sm'
		| 'icon-md'
		| 'icon-lg';
	color?: 'neutral' | 'destructive';
};

export type ButtonVariant = NonNullable<ButtonProps['variant']>;
export type ButtonSize = NonNullable<ButtonProps['size']>;
export type ButtonColor = NonNullable<ButtonProps['color']>;

type VariantKey = keyof typeof buttonVariants.variants.variant;

export function Button({
	className,
	variant = 'primary',
	size = 'md',
	color = 'neutral',
	icon = null,
	loadingIcon,
	loading = false,
	type = 'button',
	disabled = false,
	children,
	...props
}: ButtonProps) {
	const spinner = loadingIcon ?? <Spinner size={1} label={null} />;
	const look: { variant: VariantKey; color: ButtonColor } | undefined =
		LOOK[variant as keyof typeof LOOK];
	const variantName: VariantKey = look === undefined ? (variant as VariantKey) : look.variant;
	const colorName = look?.color ?? color;

	return (
		<BaseButton
			data-slot="button"
			type={type}
			data-variant={variant}
			data-color={colorName}
			data-size={size}
			data-loading={loading ? '' : undefined}
			aria-busy={loading || undefined}
			disabled={disabled || loading}
			focusableWhenDisabled={loading || undefined}
			className={cn(buttonVariants({ variant: variantName, size, color: colorName }), className)}
			{...props}
		>
			{icon ? (
				<>
					<span data-icon="start" className="contents">
						{loading ? spinner : icon}
					</span>
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
