import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const paths = {
	'circle-check':
		'M12 2a10 10 0 0 0 0 20a10 10 0 0 0 0-20zM15.293 8.293a1 1 0 0 1 1.414 0a1 1 0 0 1 0 1.414L11.207 15.207a1 1 0 0 1-1.414 0L7.293 12.707a1 1 0 0 1 0-1.414a1 1 0 0 1 1.414 0L10.5 13.086z',
	'circle-exclamation':
		'M12 2a10 10 0 0 0 0 20a10 10 0 0 0 0-20zM11 8a1 1 0 0 1 2 0v4a1 1 0 0 1-2 0zM12 15a1 1 0 0 1 0 2a1 1 0 0 1 0-2z',
	'circle-x':
		'M12 2a10 10 0 0 0 0 20a10 10 0 0 0 0-20zM12 10.586 14.293 8.293a1 1 0 0 1 1.414 0a1 1 0 0 1 0 1.414L13.414 12l2.293 2.293a1 1 0 0 1 0 1.414a1 1 0 0 1-1.414 0L12 13.414l-2.293 2.293a1 1 0 0 1-1.414 0a1 1 0 0 1 0-1.414L10.586 12 8.293 9.707a1 1 0 0 1 0-1.414a1 1 0 0 1 1.414 0z',
} as const;

export type FillIconName = keyof typeof paths;

export type FillIconProps = ComponentProps<'svg'> & { name: FillIconName };

export function FillIcon({ name, className, ...props }: FillIconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={24}
			height={24}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
			className={cn('align-middle shrink-0', className)}
			{...props}
		>
			<path fillRule="evenodd" d={paths[name]} />
		</svg>
	);
}
