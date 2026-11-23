import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type AvatarFallbackProps = Omit<ComponentProps<typeof BaseAvatar.Fallback>, 'className'> & {
	className?: string;
};

export function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
	return (
		<BaseAvatar.Fallback
			data-slot="avatar-fallback"
			className={cn('flex size-full items-center justify-center', className)}
			{...props}
		/>
	);
}
