import { Select as BaseSelect } from '@base-ui/react/select';
import type { ComponentProps } from 'react';
import { popup } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type SelectPopupProps = Omit<ComponentProps<typeof BaseSelect.Popup>, 'className'> & {
	className?: string;
};

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
