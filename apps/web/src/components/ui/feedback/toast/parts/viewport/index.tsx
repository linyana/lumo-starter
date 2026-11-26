import { Toast as BaseToast } from '@base-ui/react/toast';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import type { ToastPosition } from '../../types';
import { useToastPosition } from '../context';

const positionClasses: Record<ToastPosition, string> = {
	'top-left': 'top-4 left-4',
	'top-center': 'top-4 left-1/2 -translate-x-1/2',
	'top-right': 'top-4 right-4',
	'bottom-left': 'bottom-4 left-4',
	'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
	'bottom-right': 'bottom-4 right-4',
};

export type ToastViewportProps = Omit<ComponentProps<typeof BaseToast.Viewport>, 'className'> & {
	position?: ToastPosition;
	className?: string;
};

export function ToastViewport({ position: positionProp, className, ...props }: ToastViewportProps) {
	const contextPosition = useToastPosition();
	const position = positionProp ?? contextPosition;

	return (
		<BaseToast.Viewport
			data-slot="toast-viewport"
			data-position={position}
			className={cn(
				'pointer-events-none fixed z-70 w-90 max-w-[calc(100vw-2rem)]',
				positionClasses[position],
				className,
			)}
			{...props}
		/>
	);
}
