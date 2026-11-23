import { Radio, type RadioRootProps } from '@base-ui/react/radio';
import { toggleBox } from '@/lib/control';
import { cn } from '@/lib/utils';

export type RadioGroupItemProps<Value = unknown> = Omit<RadioRootProps<Value>, 'className'> & {
	className?: string;
};

export function RadioGroupItem<Value>({ className, ...props }: RadioGroupItemProps<Value>) {
	return (
		<Radio.Root data-slot="radio" className={cn(toggleBox, 'rounded-full', className)} {...props} />
	);
}
