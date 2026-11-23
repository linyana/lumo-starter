import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type FieldsetLegendProps = Omit<ComponentProps<typeof BaseFieldset.Legend>, 'className'> & {
	className?: string;
};

export function FieldsetLegend({ className, ...props }: FieldsetLegendProps) {
	return (
		<BaseFieldset.Legend
			data-slot="fieldset-legend"
			className={cn('text-base font-semibold data-disabled:opacity-50', className)}
			{...props}
		/>
	);
}
