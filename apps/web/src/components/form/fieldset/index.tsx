import { cn } from '@/lib/utils';
import { FieldsetLegend, FieldsetRoot } from './parts';
import type { FieldsetProps } from './types';

/** A heading, and the fields it names — one answer among the several a long form asks for. */
export const Fieldset = ({ legend, children, className, classNames }: FieldsetProps) => (
	<FieldsetRoot className={cn(className, classNames?.root)}>
		{legend !== undefined && (
			<FieldsetLegend className={classNames?.legend}>{legend}</FieldsetLegend>
		)}
		{children}
	</FieldsetRoot>
);
