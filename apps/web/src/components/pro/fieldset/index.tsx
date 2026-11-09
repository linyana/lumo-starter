import { LumoFieldset } from '@/components/ui/fieldset';
import { cn } from '@/lib/utils';
import type { FieldsetProps } from './types';

/** A heading, and the fields it names — one answer among the several a long form asks for. */
export const Fieldset = ({ legend, children, className, classNames }: FieldsetProps) => (
	<LumoFieldset.Root className={cn(className, classNames?.root)}>
		{legend !== undefined && (
			<LumoFieldset.Legend className={classNames?.legend}>{legend}</LumoFieldset.Legend>
		)}
		{children}
	</LumoFieldset.Root>
);
