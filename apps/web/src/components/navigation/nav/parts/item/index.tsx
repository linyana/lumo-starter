import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type NavItemProps = ComponentProps<'li'>;

/** The anchor a row's action and badge are positioned against. */
export function NavItem({ className, ...props }: NavItemProps) {
	return (
		<li data-slot="nav-item" className={cn('group/nav-item relative', className)} {...props} />
	);
}
