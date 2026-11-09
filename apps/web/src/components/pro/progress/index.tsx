import { LumoProgress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { ProgressProps } from './types';

/** How far a task has come: a label, its number, and the bar under both. */
export const Progress = ({ value, max, label, className, classNames }: ProgressProps) => (
	<LumoProgress.Root value={value} max={max} className={cn(className, classNames?.root)}>
		{label !== undefined && (
			<>
				<LumoProgress.Label className={classNames?.label}>{label}</LumoProgress.Label>
				<LumoProgress.Value className={classNames?.value} />
			</>
		)}
		<LumoProgress.Track className={classNames?.track}>
			<LumoProgress.Indicator className={classNames?.indicator} />
		</LumoProgress.Track>
	</LumoProgress.Root>
);
