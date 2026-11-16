import { RadioGroup as BaseRadioGroup, type RadioGroupProps } from '@base-ui/react/radio-group';
import { cn } from '@/lib/utils';

export type RadioGroupRootProps<Value = unknown> = Omit<RadioGroupProps<Value>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** The group: one value for all of the items inside it, and the arrow keys between them. */
export function RadioGroupRoot<Value>({ className, ...props }: RadioGroupRootProps<Value>) {
	return (
		<BaseRadioGroup data-slot="radio-group" className={cn('grid gap-2', className)} {...props} />
	);
}
