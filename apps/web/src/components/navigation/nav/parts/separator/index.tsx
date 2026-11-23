import type { ComponentProps } from 'react';
import { Separator as BaseSeparator } from '@/components/display/separator';
import { cn } from '@/lib/utils';

export type NavSeparatorProps = ComponentProps<typeof BaseSeparator>;

export function NavSeparator({ className, ...props }: NavSeparatorProps) {
	return (
		<BaseSeparator data-slot="nav-separator" className={cn('mx-2 w-auto', className)} {...props} />
	);
}
