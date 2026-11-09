import { LumoToggle } from '@/components/ui/toggle';
import type { ToggleProps } from './types';

/** A control that stays where it was put: one setting spelled as a control rather than an action. */
export const Toggle = <Value extends string>({
	variant = 'ghost',
	size = 'md',
	...props
}: ToggleProps<Value>) => <LumoToggle<Value> variant={variant} size={size} {...props} />;
