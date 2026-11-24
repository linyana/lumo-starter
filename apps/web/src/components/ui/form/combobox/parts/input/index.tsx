import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { fieldShell } from '@/lib/control';
import { cn } from '@/lib/utils';

export const comboboxInputVariants = tv({
	base: [fieldShell(), 'read-only:bg-muted', 'pe-9'],
	variants: {
		size: {
			sm: 'h-8 ps-2.5',
			md: 'h-9 ps-3',
			lg: 'h-10 ps-3.5',
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
