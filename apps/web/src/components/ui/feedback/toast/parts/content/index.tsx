import { Toast as BaseToast } from '@base-ui/react/toast';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const layoutClasses = cn(
	'grid grid-cols-[auto_1fr_auto] items-start gap-y-2 p-4 has-data-[slot=toast-icon]:gap-x-3',
	"[grid-template-areas:'icon_title_close']",
	"has-data-[slot=toast-description]:[grid-template-areas:'icon_title_close'_'icon_description_close']",
	"has-data-[slot=toast-actions]:not-has-data-[slot=toast-description]:[grid-template-areas:'icon_title_close'_'icon_actions_actions']",
	"has-data-[slot=toast-actions]:has-data-[slot=toast-description]:[grid-template-areas:'icon_title_close'_'icon_description_close'_'icon_actions_actions']",
	'overflow-hidden transition-opacity duration-(--duration-state)',
	'[&[data-behind]:not([data-expanded])]:pointer-events-none [&[data-behind]:not([data-expanded])]:opacity-0',
);

export type ToastContentProps = Omit<ComponentProps<typeof BaseToast.Content>, 'className'> & {
	className?: string;
};

export function ToastContent({ className, ...props }: ToastContentProps) {
	return (
		<BaseToast.Content
			data-slot="toast-content"
			className={cn(layoutClasses, className)}
			{...props}
		/>
	);
}
