import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type FieldsetRootProps = Omit<ComponentProps<typeof BaseFieldset.Root>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * A native `<fieldset>` with its frame taken off. The legend is what names the group to a reader and
 * to a screen reader alike, so a box drawn around the fields would only repeat it — and the zeroed
 * margin, padding and border undo the browser's own, which would otherwise wrap every group in it.
 * `min-w-0` is the same undo for the `min-inline-size: min-content` that makes a fieldset refuse to
 * shrink inside a flex column.
 */
export function FieldsetRoot({ className, ...props }: FieldsetRootProps) {
	return (
		<BaseFieldset.Root
			data-slot="fieldset"
			className={cn('m-0 flex min-w-0 flex-col gap-4 border-0 p-0', className)}
			{...props}
		/>
	);
}
