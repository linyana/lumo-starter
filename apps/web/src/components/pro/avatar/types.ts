import type { ReactNode } from 'react';
import type { RootProps } from '@/components/ui/avatar';
import type { SlotClassNames } from '../types';

type AvatarSize = NonNullable<RootProps['size']>;

export type AvatarSlots = 'root' | 'image' | 'fallback';

/** The registry draws a pill; a tile is the same box with one step of the radius scale on it. */
export type AvatarShape = 'circle' | 'square';

export type AvatarProps = {
	/** The picture. Without it, the fallback is what is drawn. */
	src?: string;
	/** Names the picture, and seeds the fallback's initials — the first letter of its first two words. */
	alt?: string;
	size?: AvatarSize;
	/** Outlined as a pill (the registry's own) or as a tile, for a face standing in for a thing. */
	shape?: AvatarShape;
	/** Replaces the initials taken from `alt`. */
	fallback?: ReactNode;
	className?: string;
	classNames?: SlotClassNames<AvatarSlots>;
};
