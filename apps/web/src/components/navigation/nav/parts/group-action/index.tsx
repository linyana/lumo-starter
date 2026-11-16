import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { ActionGlyph } from '../action';

export type NavGroupActionProps = ComponentProps<'button'>;

/** The "+" that belongs to a group rather than to one of its rows. */
export function NavGroupAction({ className, ...props }: NavGroupActionProps) {
	return (
		<ActionGlyph
			slot="nav-group-action"
			className={cn('inset-e-3 top-3.5', className)}
			{...props}
		/>
	);
}
