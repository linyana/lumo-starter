import { LumoBadge } from '@/components/ui/badge';
import type { BadgeProps } from './types';

/** A word that labels the thing beside it. */
export const Badge = ({ children, variant = 'default', className }: BadgeProps) => (
	<LumoBadge variant={variant} className={className}>
		{children}
	</LumoBadge>
);
