import { Select as BaseSelect } from '@base-ui/react/select';
import type { ComponentProps } from 'react';
import { backdrop } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type SelectBackdropProps = ComponentProps<typeof BaseSelect.Backdrop>;

export function SelectBackdrop({ className, ...props }: SelectBackdropProps) {
	return (
		<BaseSelect.Backdrop
			data-slot="select-backdrop"
			className={cn(backdrop, className)}
			{...props}
		/>
	);
}
