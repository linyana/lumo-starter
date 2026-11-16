import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type FieldsetLegendProps = Omit<ComponentProps<typeof BaseFieldset.Legend>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The name of the group. It is louder than a `FieldLabel`, because it is a heading over several of
 * them rather than the name of one control — and a group that is disabled dims as one.
 */
export function FieldsetLegend({ className, ...props }: FieldsetLegendProps) {
	return (
		<BaseFieldset.Legend
			data-slot="fieldset-legend"
			className={cn('text-base font-semibold data-disabled:opacity-50', className)}
			{...props}
		/>
	);
}
