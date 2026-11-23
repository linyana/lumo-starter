import { cn } from '@/lib/utils';
import { FieldsetLegend, FieldsetRoot } from './parts';
import type { FieldsetProps } from './types';

export const Fieldset = ({ legend, children, className, classNames }: FieldsetProps) => (
	<FieldsetRoot className={cn(className, classNames?.root)}>
		{legend !== undefined && (
			<FieldsetLegend className={classNames?.legend}>{legend}</FieldsetLegend>
		)}
		{children}
	</FieldsetRoot>
);
