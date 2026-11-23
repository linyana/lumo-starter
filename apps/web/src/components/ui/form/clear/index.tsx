import { X } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { clearButton } from '@/lib/control';
import { cn } from '@/lib/utils';

export type ClearProps = Omit<ComponentProps<'button'>, 'type' | 'children'> & {
	label?: string;
	children?: ReactNode;
};

export function Clear({ className, label = 'Clear', children, ...props }: ClearProps) {
	return (
		<button type="button" aria-label={label} className={cn(clearButton, className)} {...props}>
			{children ?? <X />}
		</button>
	);
}

export function clearField(field: HTMLInputElement | HTMLTextAreaElement): void {
	const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(field), 'value')?.set;

	setter?.call(field, '');
	field.dispatchEvent(new Event('input', { bubbles: true }));
}
