import { Select as BaseSelect } from '@base-ui/react/select';
import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { fieldShell, iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';

export const selectTriggerVariants = tv({
	base: [
		fieldShell,
		'group relative flex cursor-pointer items-center justify-between gap-2 text-left select-none',
		'data-popup-open:bg-muted',
		'data-readonly:bg-muted data-readonly:cursor-default',
		iconSlot,
	],
	variants: {
		size: {
			sm: 'h-8 px-2.5 text-sm',
			md: 'h-9 px-3 text-sm',
			lg: 'h-10 px-3.5 text-base',
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

export type SelectTriggerProps = Omit<ComponentProps<typeof BaseSelect.Trigger>, 'className'> &
	VariantProps<typeof selectTriggerVariants> & {
		className?: string;
	};

export function SelectTrigger({ className, size = 'md', ...props }: SelectTriggerProps) {
	return (
		<BaseSelect.Trigger
			data-slot="select-trigger"
			data-size={size}
			className={cn(selectTriggerVariants({ size }), className)}
			{...props}
		/>
	);
}
