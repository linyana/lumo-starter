import type { ReactNode } from 'react';
import type { LumoBadgeProps } from '@/components/ui/badge';

type BadgeVariant = NonNullable<LumoBadgeProps['variant']>;

export type BadgeProps = {
	children: ReactNode;
	/** The surface: three fills a button also has, and four outcome tints. */
	variant?: BadgeVariant;
	className?: string;
};
