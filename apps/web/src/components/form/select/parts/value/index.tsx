import { Select as BaseSelect } from '@base-ui/react/select';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SelectValueProps = Omit<ComponentProps<typeof BaseSelect.Value>, 'className'> & {
	/** Merged with `cn()`. */
	className?: string;
};

/**
 * The chosen label, or the `placeholder` while there is none. It is the part that truncates, so a
 * long option cannot push the caret out of the trigger — and in `multiple` mode it is the several
 * labels, joined, unless `children` says otherwise.
 */
export function SelectValue({ className, ...props }: SelectValueProps) {
	return (
		<BaseSelect.Value
			data-slot="select-value"
			className={cn('min-w-0 flex-1 truncate', 'data-placeholder:text-muted-foreground', className)}
			{...props}
		/>
	);
}
