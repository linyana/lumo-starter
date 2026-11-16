import { Select as BaseSelect } from '@base-ui/react/select';
import type { ComponentProps } from 'react';
import { popup } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type SelectPopupProps = Omit<ComponentProps<typeof BaseSelect.Popup>, 'className'> & {
	/** Merged with `cn()`. */
	className?: string;
};

/**
 * The panel: at least as wide as the trigger, and never taller than the room the viewport left it.
 * The list inside is what scrolls, so the arrows at either end stay on screen.
 */
export function SelectPopup({ className, ...props }: SelectPopupProps) {
	return (
		<BaseSelect.Popup
			data-slot="select-popup"
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
