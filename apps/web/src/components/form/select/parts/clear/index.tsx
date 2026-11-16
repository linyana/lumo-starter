import { Clear as ClearButton, type ClearProps as ClearButtonProps } from '@/components/form/clear';
import { cn } from '@/lib/utils';

export type SelectClearProps = Omit<ClearButtonProps, 'data-slot'> & {
	/** Merged with `cn()`. */
	className?: string;
};

/**
 * The way back to no choice at all, beside the caret. It is the library's own cross — Base UI's select
 * has no clear part — and it is drawn here rather than inside the trigger because that is a `<button>`
 * and a button in a button is not one.
 *
 * Nothing is cleared by itself: the value belongs to the caller, so `onClick` is how it says what
 * emptying means — which is also why the field, not this part, decides when one is mounted.
 */
export function SelectClear({ className, ...props }: SelectClearProps) {
	return (
		<ClearButton
			data-slot="select-clear"
			className={cn('absolute inset-y-0 end-8 my-auto', className)}
			{...props}
		/>
	);
}
