import { cn } from '@/lib/utils';
import {
	SliderControl,
	SliderIndicator,
	SliderLabel,
	SliderRoot,
	SliderThumb,
	SliderTrack,
	SliderValue,
} from './parts';
import type { SliderProps } from './types';

/** A setting that is a number on a line: a groove, what is already taken of it, and the knob. */
export const Slider = ({ label, onChange, className, classNames, ...props }: SliderProps) => (
	<SliderRoot onValueChange={onChange} className={cn(className, classNames?.root)} {...props}>
		{label !== undefined && (
			<>
				<SliderLabel className={classNames?.label}>{label}</SliderLabel>
				<SliderValue className={classNames?.value} />
			</>
		)}
		<SliderControl className={classNames?.control}>
			<SliderTrack className={classNames?.track}>
				<SliderIndicator className={classNames?.indicator} />
				<SliderThumb className={classNames?.thumb} />
			</SliderTrack>
		</SliderControl>
	</SliderRoot>
);
