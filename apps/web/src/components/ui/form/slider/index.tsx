import { ControlSpinner } from '@/components/ui/form/loading';
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

export const Slider = ({
	label,
	loading = false,
	onChange,
	className,
	classNames,
	...props
}: SliderProps) => (
	<SliderRoot
		onValueChange={onChange}
		className={cn(className, classNames?.root)}
		{...props}
		disabled={props.disabled === true || loading}
		data-loading={loading ? '' : undefined}
		aria-busy={loading || undefined}
	>
		{label !== undefined && (
			<>
				<SliderLabel className={classNames?.label}>{label}</SliderLabel>
				<SliderValue className={classNames?.value} />
			</>
		)}
		<SliderControl className={classNames?.control}>
			<SliderTrack className={classNames?.track}>
				<SliderIndicator className={classNames?.indicator} />
				<SliderThumb
					className={cn(
						loading && 'flex items-center justify-center border-0 bg-transparent shadow-none',
						classNames?.thumb,
					)}
				>
					{loading && <ControlSpinner size="0.75em" className="text-muted-foreground" />}
				</SliderThumb>
			</SliderTrack>
		</SliderControl>
	</SliderRoot>
);
