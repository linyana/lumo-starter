import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { useTabs } from '../context';

export const indicatorVariants = tv({
	base: [
		'pointer-events-none absolute top-0 left-0 z-0',
		'h-(--active-tab-height) w-(--active-tab-width)',
		'translate-x-(--active-tab-left) translate-y-(--active-tab-top)',
		'transition-[translate,width,height]',
		'duration-(--duration-overlay) ease-(--ease-overlay)',
	],
	variants: {
		variant: {
			rounded: 'rounded-md bg-card shadow-sm',
			pill: 'rounded-md bg-secondary',
			square: [
				'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary',
				'data-[orientation=vertical]:after:inset-x-auto',
				'data-[orientation=vertical]:after:inset-y-0 data-[orientation=vertical]:after:right-0',
				'data-[orientation=vertical]:after:h-auto data-[orientation=vertical]:after:w-0.5',
			],
			point: [
				'after:absolute after:bottom-1 after:left-1/2 after:size-1.5',
				'after:-translate-x-1/2 after:rounded-full after:bg-primary',
			],
		},
	},
	defaultVariants: {
		variant: 'rounded',
	},
});

export type TabsIndicatorProps = Omit<ComponentProps<typeof BaseTabs.Indicator>, 'className'> &
	VariantProps<typeof indicatorVariants> & {
		className?: string;
	};

export function TabsIndicator({ className, variant, ...props }: TabsIndicatorProps) {
	const context = useTabs();
	const resolved = variant ?? context.variant;

	return (
		<BaseTabs.Indicator
			data-slot="tabs-indicator"
			data-variant={resolved}
			className={cn(indicatorVariants({ variant: resolved }), className)}
			{...props}
		/>
	);
}
