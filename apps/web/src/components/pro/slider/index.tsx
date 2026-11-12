import { LumoSlider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { SliderProps } from './types';

/** A setting that is a number on a line: a groove, what is already taken of it, and the knob. */
export const Slider = ({ label, onChange, className, classNames, ...props }: SliderProps) => (
	<LumoSlider.Root onValueChange={onChange} className={cn(className, classNames?.root)} {...props}>
		{label !== undefined && (
			<>
				<LumoSlider.Label className={classNames?.label}>{label}</LumoSlider.Label>
				<LumoSlider.Value className={classNames?.value} />
			</>
		)}
		<LumoSlider.Control className={classNames?.control}>
			<LumoSlider.Track className={classNames?.track}>
				<LumoSlider.Indicator className={classNames?.indicator} />
				<LumoSlider.Thumb className={classNames?.thumb} />
			</LumoSlider.Track>
		</LumoSlider.Control>
	</LumoSlider.Root>
);
