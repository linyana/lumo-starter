import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { controlHeight, fieldShell } from '@/lib/control';
import { cn } from '@/lib/utils';

export const comboboxInputVariants = tv({
	base: [fieldShell(), 'read-only:bg-muted', 'pe-9'],
	variants: {
		size: {
			sm: `${controlHeight.sm} ps-2.5`,
			md: `${controlHeight.md} ps-3`,
			lg: `${controlHeight.lg} ps-3.5`,
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

export type ComboboxInputProps = Omit<
	ComponentProps<typeof BaseCombobox.Input>,
	'className' | 'size'
> &
	VariantProps<typeof comboboxInputVariants> & {
		className?: string;
	};

export function ComboboxInput({ className, size = 'md', ...props }: ComboboxInputProps) {
	return (
		<BaseCombobox.Input
			data-slot="combobox-input"
			data-size={size}
			className={cn(comboboxInputVariants({ size }), className)}
			{...props}
		/>
	);
}
