import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { ChevronDown } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { iconSlot, stateLayer } from '@/lib/control';
import { cn } from '@/lib/utils';

const adornmentClass = cn(
	'absolute inset-y-0 my-auto flex size-7 items-center justify-center rounded-md',
	'text-muted-foreground transition-colors duration-(--duration-state)',
	'hover:text-foreground',
	'data-disabled:pointer-events-none data-disabled:opacity-50',
	iconSlot,
	stateLayer,
);

export type ComboboxTriggerProps = Omit<ComponentProps<typeof BaseCombobox.Trigger>, 'children'> & {
	children?: ReactNode;
	className?: string;
};

export function ComboboxTrigger({
	className,
	children,
	'aria-label': label = 'Open popup',
	...props
}: ComboboxTriggerProps) {
	return (
		<BaseCombobox.Trigger
			data-slot="combobox-trigger"
			aria-label={label}
			className={cn(adornmentClass, 'end-0.5 data-popup-open:rotate-180', className)}
			{...props}
		>
			{children ?? <ChevronDown />}
		</BaseCombobox.Trigger>
	);
}
