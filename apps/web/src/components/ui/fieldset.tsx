import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type RootProps = Omit<ComponentProps<typeof BaseFieldset.Root>, 'className'> & {
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
export function Root({ className, ...props }: RootProps) {
	return (
		<BaseFieldset.Root
			data-slot="fieldset"
			className={cn('m-0 flex min-w-0 flex-col gap-4 border-0 p-0', className)}
			{...props}
		/>
	);
}

export type LegendProps = Omit<ComponentProps<typeof BaseFieldset.Legend>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The name of the group. It is louder than a `LumoField.Label`, because it is a heading over several of
 * them rather than the name of one control — and a group that is disabled dims as one.
 */
export function Legend({ className, ...props }: LegendProps) {
	return (
		<BaseFieldset.Legend
			data-slot="fieldset-legend"
			className={cn('text-base font-semibold data-disabled:opacity-50', className)}
			{...props}
		/>
	);
}

/** A heading, and the fields it names — one answer among the several a long form asks for. */
export const LumoFieldset = { Root, Legend };
