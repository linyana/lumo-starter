import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import type { ComponentProps } from 'react';
import { toggleBox } from '@/lib/control';
import { cn } from '@/lib/utils';

export type CheckboxRootProps = Omit<ComponentProps<typeof BaseCheckbox.Root>, 'className'> & {
	className?: string;
};

export function CheckboxRoot({ className, ...props }: CheckboxRootProps) {
	return (
		<BaseCheckbox.Root
			data-slot="checkbox"
			className={cn(
				toggleBox,
				'rounded-sm text-primary-foreground',
				'data-checked:bg-primary',
				'data-indeterminate:border-primary data-indeterminate:bg-primary',
				className,
			)}
			{...props}
		/>
	);
}
