import { Toast as BaseToast } from '@base-ui/react/toast';
import { X } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { buttonVariants } from '@/components/ui/form/button';
import { cn } from '@/lib/utils';

const closeClasses = cn(
	buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
	'-my-1 -me-1 size-7 self-start text-muted-foreground [grid-area:close]',
);

const closeGlyph = <X />;

export type ToastCloseProps = Omit<
	ComponentProps<typeof BaseToast.Close>,
	'className' | 'children'
> & {
	className?: string;
	children?: ReactNode;
};

export function ToastClose({ className, children = closeGlyph, ...props }: ToastCloseProps) {
	return (
		<BaseToast.Close
			data-slot="toast-close"
			aria-label="Dismiss"
			className={cn(closeClasses, className)}
			{...props}
		>
			{children}
		</BaseToast.Close>
	);
}
