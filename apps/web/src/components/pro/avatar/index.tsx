import { LumoAvatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { AvatarProps, AvatarShape } from './types';

/**
 * What a name stands for before its picture arrives: the first letter of its first two words, so
 * `Lumo Tester` reads as `LT`, a one-word name keeps its own letter and a CJK name its character.
 * Split on whitespace, and read by code point, so an emoji or a surrogate pair is never halved.
 */
const initials = (name: string): string =>
	name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((word) => Array.from(word)[0] ?? '')
		.join('')
		.toUpperCase();

/**
 * The outline, as the one class the registry's `rounded-full` is replaced by. It sits ahead of the
 * caller's `className` in the merge, so a call site that wants another radius still has the last
 * word — and `rounded-full` never has to be undone by an `!`.
 */
const shapeClass: Record<AvatarShape, string> = {
	circle: 'rounded-full',
	square: 'rounded-md',
};

/** A face, or the initials standing in for one, in whichever of the two outlines it is drawn. */
export const Avatar = ({
	src,
	alt = '',
	size = 'md',
	shape = 'circle',
	fallback,
	className,
	classNames,
}: AvatarProps) => (
	<LumoAvatar.Root size={size} className={cn(shapeClass[shape], className, classNames?.root)}>
		{src !== undefined && <LumoAvatar.Image src={src} alt={alt} className={classNames?.image} />}
		<LumoAvatar.Fallback className={classNames?.fallback}>
			{fallback ?? initials(alt)}
		</LumoAvatar.Fallback>
	</LumoAvatar.Root>
);
