import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const SettingsGroupRoot = ({ className, ...props }: ComponentProps<'section'>) => (
	<section
		data-slot="settings-group"
		className={cn('@container space-y-4', className)}
		{...props}
	/>
);
