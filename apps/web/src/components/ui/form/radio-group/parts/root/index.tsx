import { RadioGroup as BaseRadioGroup, type RadioGroupProps } from '@base-ui/react/radio-group';
import { cn } from '@/lib/utils';

export type RadioGroupRootProps<Value = unknown> = Omit<RadioGroupProps<Value>, 'className'> & {
	className?: string;
};

export function RadioGroupRoot<Value>({ className, ...props }: RadioGroupRootProps<Value>) {
	return (
		<BaseRadioGroup data-slot="radio-group" className={cn('grid gap-2', className)} {...props} />
	);
}
