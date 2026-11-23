import { cn } from '@/lib/utils';
import { AvatarFallback, AvatarImage, AvatarRoot } from './parts';
import type { AvatarProps, AvatarShape } from './types';

const initials = (name: string): string =>
	name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((word) => Array.from(word)[0] ?? '')
		.join('')
		.toUpperCase();

const shapeClass: Record<AvatarShape, string> = {
	circle: 'rounded-full',
	square: 'rounded-md',
};

export const Avatar = ({
	src,
	alt = '',
	size = 'md',
	shape = 'circle',
	fallback,
	className,
	classNames,
}: AvatarProps) => (
	<AvatarRoot size={size} className={cn(shapeClass[shape], className, classNames?.root)}>
		{src !== undefined && <AvatarImage src={src} alt={alt} className={classNames?.image} />}
		<AvatarFallback className={classNames?.fallback}>{fallback ?? initials(alt)}</AvatarFallback>
	</AvatarRoot>
);
