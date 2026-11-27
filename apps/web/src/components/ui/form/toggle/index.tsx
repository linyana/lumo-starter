import { Toggle as BaseToggle, type ToggleProps as BaseToggleProps } from '@base-ui/react/toggle';
import { tv, type VariantProps } from 'tailwind-variants';
import { ControlLoading } from '@/components/ui/form/loading';
import { controlHeight, fieldText, iconSlot, pressable, stateLayer } from '@/lib/control';
import { cn } from '@/lib/utils';

export type ToggleVariant = 'ghost' | 'outline';
export type ToggleSize = 'sm' | 'md' | 'lg' | 'icon';

export const toggleVariants = tv({
	base: [
		'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap',
		'relative rounded-md font-medium select-none',
		'transition-[color,background-color,border-color,translate,scale]',
		'ease-(--ease-spring) duration-(--duration-state)',
		pressable,
		stateLayer,
		'data-pressed:after:opacity-(--state-layer-hover-opacity)',
		'data-pressed:hover:after:opacity-(--state-layer-selected-hover-opacity)',
		'data-pressed:active:after:opacity-(--state-layer-pressed-opacity)',
		'data-disabled:pointer-events-none data-disabled:opacity-50',
		'data-loading:cursor-progress',
		'data-loading:disabled:opacity-100 data-loading:data-disabled:opacity-100',
		iconSlot,
	],
	variants: {
		variant: {
			ghost: 'bg-transparent',
			outline: 'border bg-background',
		},
		size: {
			sm: `${controlHeight.sm} gap-1.5 px-3 ${fieldText.sm}`,
			md: `${controlHeight.md} px-4 ${fieldText.md}`,
			lg: `${controlHeight.lg} px-6 ${fieldText.lg}`,
			icon: 'size-8 text-sm',
		},
	},
	defaultVariants: {
		variant: 'ghost',
		size: 'md',
	},
});

export type ToggleProps<Value extends string = string> = Omit<BaseToggleProps<Value>, 'className'> &
	VariantProps<typeof toggleVariants> & {
		className?: string;
		loading?: boolean;
	};

export function Toggle<Value extends string>({
	className,
	variant = 'ghost',
	size = 'md',
	loading = false,
	disabled = false,
	children,
	...props
}: ToggleProps<Value>) {
	return (
		<BaseToggle
			data-slot="toggle"
			data-variant={variant}
			data-size={size}
			data-loading={loading ? '' : undefined}
			aria-busy={loading || undefined}
			disabled={disabled || loading}
			className={cn(toggleVariants({ variant, size }), className)}
			{...props}
		>
			{loading ? <ControlLoading loading>{children}</ControlLoading> : children}
		</BaseToggle>
	);
}
