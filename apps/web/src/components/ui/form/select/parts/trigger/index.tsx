import { Select as BaseSelect } from '@base-ui/react/select';
import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { controlHeight, fieldShell, fieldText, iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';

export const selectTriggerVariants = tv({
	base: [
		fieldShell({ hover: 'tint' }),
		'group relative flex cursor-pointer items-center justify-between gap-2 text-left select-none',
		'hover:bg-accent pressed:bg-accent data-popup-open:bg-accent',
		'data-readonly:bg-muted data-readonly:cursor-default',
		iconSlot,
	],
	variants: {
		size: {
			sm: `${controlHeight.sm} px-2.5 ${fieldText.sm}`,
			md: `${controlHeight.md} px-3 ${fieldText.md}`,
			lg: `${controlHeight.lg} px-3.5 ${fieldText.lg}`,
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
