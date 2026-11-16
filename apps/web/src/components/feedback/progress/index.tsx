import { cn } from '@/lib/utils';
import {
	ProgressIndicator,
	ProgressLabel,
	ProgressRoot,
	ProgressTrack,
	ProgressValue,
} from './parts';
import type { ProgressProps } from './types';

/** How far a task has come: a label, its number, and the bar under both. */
export const Progress = ({ value, max, label, className, classNames }: ProgressProps) => (
	<ProgressRoot value={value} max={max} className={cn(className, classNames?.root)}>
		{label !== undefined && (
			<>
				<ProgressLabel className={classNames?.label}>{label}</ProgressLabel>
				<ProgressValue className={classNames?.value} />
			</>
		)}
		<ProgressTrack className={classNames?.track}>
			<ProgressIndicator className={classNames?.indicator} />
		</ProgressTrack>
	</ProgressRoot>
);
