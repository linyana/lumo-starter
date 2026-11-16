import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ComponentProps } from 'react';
import { popup } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type ComboboxPopupProps = Omit<ComponentProps<typeof BaseCombobox.Popup>, 'className'> & {
	/** Merged with `cn()`. */
	className?: string;
};

/**
 * The panel: at least as wide as the field, and never taller than the room the viewport left it. The
 * list inside is what scrolls, so the empty message and the status line stay where they are.
 */
export function ComboboxPopup({ className, ...props }: ComboboxPopupProps) {
	return (
		<BaseCombobox.Popup
			data-slot="combobox-popup"
			className={cn(
				'relative flex max-h-(--available-height) min-w-(--anchor-width) flex-col',
				'overflow-clip rounded-lg border bg-popover text-popover-foreground shadow-lifted',
				'outline-none',
				popup,
				className,
			)}
			{...props}
		/>
	);
}
