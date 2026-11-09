import { LumoAvatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { AvatarProps } from './types';

/** A face, or the initials standing in for one. */
export const Avatar = ({
	src,
	alt = '',
	size = 'md',
	fallback,
	className,
	classNames,
}: AvatarProps) => (
	<LumoAvatar.Root size={size} className={cn(className, classNames?.root)}>
		{src !== undefined && <LumoAvatar.Image src={src} alt={alt} className={classNames?.image} />}
		<LumoAvatar.Fallback className={classNames?.fallback}>
			{fallback ?? alt.charAt(0).toUpperCase()}
		</LumoAvatar.Fallback>
	</LumoAvatar.Root>
);
