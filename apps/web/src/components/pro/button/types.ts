import type { LumoButtonProps } from '@/components/ui/button';
import type { ReactNode } from 'react';

type LumoProps = Pick<
	LumoButtonProps,
	| 'loading'
	| 'disabled'
	| 'icon'
	| 'className'
	| 'variant'
	| 'style'
	| 'size'
	| 'onClick'
	| 'type'
	| 'title'
	| 'tabIndex'
> & { 'aria-label'?: string };

export type ButtonProps = LumoProps & {
	children: ReactNode;
};
