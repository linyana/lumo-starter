import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { useTabs } from '../context';

export const listVariants = tv({
	base: [
		'relative flex w-fit items-center',
		'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
	],
	variants: {
		variant: {
			rounded: 'gap-1 rounded-lg bg-muted p-1',
			pill: 'gap-1 rounded-lg bg-card p-1',
			square: [
				'gap-4',
				'shadow-[inset_0_-1px_0_var(--border)]',
				'data-[orientation=vertical]:shadow-[inset_-1px_0_0_var(--border)]',
			],
			point: 'gap-4',
		},
	},
	defaultVariants: {
		variant: 'rounded',
	},
});

export type TabsListProps = Omit<ComponentProps<typeof BaseTabs.List>, 'className'> &
	VariantProps<typeof listVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
	};

export function TabsList({ className, variant, ...props }: TabsListProps) {
	const context = useTabs();
	const resolved = variant ?? context.variant;

	return (
		<BaseTabs.List
			data-slot="tabs-list"
			data-variant={resolved}
			className={cn(listVariants({ variant: resolved }), className)}
			{...props}
		/>
	);
}
