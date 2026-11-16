import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import type { ComponentProps } from 'react';
import { toggleBox } from '@/lib/control';
import { cn } from '@/lib/utils';

export type CheckboxRootProps = Omit<ComponentProps<typeof BaseCheckbox.Root>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** A 16px box that carries its own hidden input, so a form and a label both see a checkbox. */
export function CheckboxRoot({ className, ...props }: CheckboxRootProps) {
	return (
		<BaseCheckbox.Root
			data-slot="checkbox"
			className={cn(
				toggleBox,
				// A checkbox fills when it is checked, and the tick is the surface's own colour.
				'rounded-sm text-primary-foreground',
				'data-checked:bg-primary',
				'data-indeterminate:border-primary data-indeterminate:bg-primary',
				className,
			)}
			{...props}
		/>
	);
}
