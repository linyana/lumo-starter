import { X } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { clearButton } from '@/lib/control';
import { cn } from '@/lib/utils';

export type ClearProps = Omit<ComponentProps<'button'>, 'type' | 'children'> & {
	/** The words the button is labelled with, for a reader who cannot see the cross. */
	label?: string;
	/** Replaces the cross. */
	children?: ReactNode;
};

/**
 * The way out of a field that can be emptied: the button and the cross on it, and nothing about where
 * it sits — that is the field's, because only the field knows where its own end is. The `data-slot` is
 * the caller's for the same reason: it is what the field's room on the end is keyed to, so the space a
 * missing cross does not need is not left empty.
 */
export function Clear({ className, label = 'Clear', children, ...props }: ClearProps) {
	return (
		<button type="button" aria-label={label} className={cn(clearButton, className)} {...props}>
			{children ?? <X />}
		</button>
	);
}

/**
 * Empties a field the way the browser would rather than the way React does: the value setter React
 * installs on the node is the one its own change detection reads, so it is bypassed and the event the
 * browser would have fired is fired. A field handed a value and a field typed into both answer to it,
 * so a call site never says which of the two it is.
 */
export function clearField(field: HTMLInputElement | HTMLTextAreaElement): void {
	const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(field), 'value')?.set;

	setter?.call(field, '');
	field.dispatchEvent(new Event('input', { bubbles: true }));
}
