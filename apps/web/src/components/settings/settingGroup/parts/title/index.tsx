import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const SettingsGroupTitle = ({ className, ...props }: ComponentProps<'h2'>) => (
	<h2
		data-slot="settings-group-title"
		className={cn('px-4 text-l font-medium', className)}
		{...props}
	/>
);
