import { Toast as BaseToast } from '@base-ui/react/toast';
import { X } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { buttonVariants } from '@/components/form/button';
import { cn } from '@/lib/utils';

const closeClasses = cn(
	buttonVariants({ variant: 'ghost', size: 'icon' }),
	'-my-1 size-7 text-muted-foreground',
);

const closeGlyph = <X />;

export type ToastCloseProps = Omit<
	ComponentProps<typeof BaseToast.Close>,
	'className' | 'children'
> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
	/** Defaults to a cross. Give one to say "dismiss" in another glyph. */
	children?: ReactNode;
};

export function ToastClose({ className, children = closeGlyph, ...props }: ToastCloseProps) {
	return (
		<BaseToast.Close
			data-slot="toast-close"
			aria-label="ToastClose"
			className={cn(closeClasses, className)}
			{...props}
		>
			{children}
		</BaseToast.Close>
	);
}
