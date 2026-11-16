import { Radio, type RadioRootProps } from '@base-ui/react/radio';
import { toggleBox } from '@/lib/control';
import { cn } from '@/lib/utils';

export type RadioGroupItemProps<Value = unknown> = Omit<RadioRootProps<Value>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** One option. Base UI's `Radio`, named for what it is within the group rather than on its own. */
export function RadioGroupItem<Value>({ className, ...props }: RadioGroupItemProps<Value>) {
	return (
		<Radio.Root
			data-slot="radio"
			// A radio keeps its ring and puts a dot in it, so only the box is the checkbox's.
			className={cn(toggleBox, 'rounded-full', className)}
			{...props}
		/>
	);
}
