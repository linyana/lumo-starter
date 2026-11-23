import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { AvatarRootProps } from './parts';

type AvatarSize = NonNullable<AvatarRootProps['size']>;

export type AvatarSlots = 'root' | 'image' | 'fallback';

export type AvatarShape = 'circle' | 'square';

export type AvatarProps = {
	src?: string;
	alt?: string;
	size?: AvatarSize;
	shape?: AvatarShape;
	fallback?: ReactNode;
	className?: string;
	classNames?: SlotClassNames<AvatarSlots>;
};
