import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { ActionGlyph } from '../action';

export type NavGroupActionProps = ComponentProps<'button'>;

export function NavGroupAction({ className, ...props }: NavGroupActionProps) {
	return (
		<ActionGlyph
			slot="nav-group-action"
			className={cn('inset-e-3 top-3.5', className)}
			{...props}
		/>
	);
}
