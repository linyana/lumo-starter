import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { ComponentProps } from 'react';

export type TooltipTriggerProps = ComponentProps<typeof BaseTooltip.Trigger>;

export const TooltipTrigger = ({ ...props }: TooltipTriggerProps) => (
	<BaseTooltip.Trigger delay={100} {...props} />
);
