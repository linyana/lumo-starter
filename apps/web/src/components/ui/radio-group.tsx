import { Radio, type RadioRootProps } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup, type RadioGroupProps } from '@base-ui/react/radio-group';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { toggleBox, toggleMark } from '@/lib/control';

export type RootProps<Value = unknown> = Omit<RadioGroupProps<Value>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** The group: one value for all of the items inside it, and the arrow keys between them. */
export function Root<Value>({ className, ...props }: RootProps<Value>) {
	return (
		<BaseRadioGroup
			data-slot="radio-group"
			className={cn('grid gap-2', className)}
			{...props}
		/>
	);
}

export type ItemProps<Value = unknown> = Omit<RadioRootProps<Value>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** One option. Base UI's `Radio`, named for what it is within the group rather than on its own. */
export function Item<Value>({ className, ...props }: ItemProps<Value>) {
	return (
		<Radio.Root
			data-slot="radio"
			// A radio keeps its ring and puts a dot in it, so only the box is the checkbox's.
			className={cn(toggleBox, 'rounded-full', className)}
			{...props}
		/>
	);
}

export type IndicatorProps = Omit<ComponentProps<typeof Radio.Indicator>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** The dot. Mounted only for the item that holds the group's value. */
export function Indicator({ className, ...props }: IndicatorProps) {
	return (
		<Radio.Indicator
			data-slot="radio-indicator"
			className={cn(
				'size-2 rounded-full bg-primary',
				toggleMark,
				'data-starting-style:scale-50 data-ending-style:scale-50',
				className,
			)}
			{...props}
		/>
	);
}

/** Exactly one of these. Give the group a name with `Field`, and each item one with `Field.Item`. */
export const RadioGroup = { Root, Item, Indicator };
