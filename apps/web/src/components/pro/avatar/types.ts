import type { ReactNode } from 'react';
import type { RootProps } from '@/components/ui/avatar';
import type { SlotClassNames } from '../types';

type AvatarSize = NonNullable<RootProps['size']>;

export type AvatarSlots = 'root' | 'image' | 'fallback';

export type AvatarProps = {
	/** The picture. Without it, the fallback is what is drawn. */
	src?: string;
	/** Names the picture, and seeds the fallback's initials. */
	alt?: string;
	size?: AvatarSize;
	/** Replaces the initials taken from `alt`. */
	fallback?: ReactNode;
	className?: string;
	classNames?: SlotClassNames<AvatarSlots>;
};
