import { Slider as BaseSlider } from '@base-ui/react/slider';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SliderThumbProps = Omit<ComponentProps<typeof BaseSlider.Thumb>, 'className'> & {
	className?: string;
};

export function SliderThumb({ className, ...props }: SliderThumbProps) {
	return (
		<BaseSlider.Thumb
			data-slot="slider-thumb"
			className={cn(
				'block size-4 shrink-0 cursor-grab rounded-full select-none',
				'border border-input bg-background shadow-sm',
				'transition-[border-color,scale] duration-(--duration-state) ease-(--ease-spring)',
				'hover:not-data-disabled:border-input-strong',
				'has-[:focus-visible]:border-input-strong',
				'data-dragging:scale-110 data-dragging:border-primary data-dragging:cursor-grabbing',
				'data-disabled:cursor-not-allowed data-disabled:opacity-50',
				className,
			)}
			{...props}
		/>
	);
}
