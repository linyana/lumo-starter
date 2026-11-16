import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ComboboxEmptyProps = Omit<ComponentProps<typeof BaseCombobox.Empty>, 'className'> & {
	/** Merged with `cn()`. */
	className?: string;
};

/**
 * What the list says when nothing matches. The element Base UI mounts stays empty and mounted — a
 * live message that comes and goes is announced unreliably — so the look is on a box inside it,
 * which exists only while there is something to say. `className` lands on that box.
 */
export function ComboboxEmpty({ className, children, ...props }: ComboboxEmptyProps) {
	return (
		<BaseCombobox.Empty data-slot="combobox-empty" {...props}>
			<div className={cn('px-4 py-6 text-center text-sm text-muted-foreground', className)}>
				{children ?? 'no match.'}
			</div>
		</BaseCombobox.Empty>
	);
}
