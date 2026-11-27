import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ComponentProps } from 'react';
import { popup } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type ComboboxPopupProps = Omit<ComponentProps<typeof BaseCombobox.Popup>, 'className'> & {
	className?: string;
};

export function ComboboxPopup({ className, ...props }: ComboboxPopupProps) {
	return (
		<BaseCombobox.Popup
			data-slot="combobox-popup"
			className={cn(
				'relative flex max-h-(--available-height) min-w-(--anchor-width) flex-col',
				'overflow-clip rounded-lg border bg-popover text-popover-foreground shadow-lg',
				'outline-none',
				popup,
				className,
			)}
			{...props}
		/>
	);
}
