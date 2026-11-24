import { Switch as BaseSwitch } from '@base-ui/react/switch';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SwitchRootProps = Omit<ComponentProps<typeof BaseSwitch.Root>, 'className'> & {
	className?: string;
};

export function SwitchRoot({ className, ...props }: SwitchRootProps) {
	return (
		<BaseSwitch.Root
			data-slot="switch"
			className={cn(
				'inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5',
				'bg-input transition-colors duration-(--duration-state)',
				'hover:not-disabled:not-data-disabled:not-data-checked:bg-input-strong',
				'not-data-checked:focus-visible:bg-input-strong',
				'not-data-checked:focus-visible:outline-none',
				'data-checked:bg-primary',
				'data-disabled:cursor-not-allowed data-disabled:opacity-50',
				'data-loading:cursor-progress',
				'data-loading:data-disabled:opacity-100',
				className,
			)}
			{...props}
		/>
	);
}
