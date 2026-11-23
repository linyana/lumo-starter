import { Toast as BaseToast } from '@base-ui/react/toast';
import type { ComponentProps } from 'react';
import { buttonVariants } from '@/components/ui/form/button';
import { cn } from '@/lib/utils';

const actionClasses = cn(
	buttonVariants({ variant: 'secondary', size: 'sm' }),
	'-my-1 h-7 px-2 text-xs',
);

export type ToastActionProps = Omit<ComponentProps<typeof BaseToast.Action>, 'className'> & {
	className?: string;
};

export function ToastAction({ className, ...props }: ToastActionProps) {
	return (
		<BaseToast.Action
			data-slot="toast-action"
			className={cn(actionClasses, className)}
			{...props}
		/>
	);
}
