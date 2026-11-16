import { Toast as BaseToast } from '@base-ui/react/toast';
import type { ComponentProps } from 'react';
import { buttonVariants } from '@/components/form/button';
import { cn } from '@/lib/utils';

/**
 * A toast's action is a Button's small secondary shape, pulled up a pixel so it sits on the text's
 * line rather than the row's full height.
 */
const actionClasses = cn(
	buttonVariants({ variant: 'secondary', size: 'sm' }),
	'-my-1 h-7 px-2 text-xs',
);

export type ToastActionProps = Omit<ComponentProps<typeof BaseToast.Action>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * Takes its label from `actionProps` on the toast, so a caller that only queued one never has to
 * come back and render it. Renders nothing when the toast carries no action.
 */
export function ToastAction({ className, ...props }: ToastActionProps) {
	return (
		<BaseToast.Action
			data-slot="toast-action"
			className={cn(actionClasses, className)}
			{...props}
		/>
	);
}
