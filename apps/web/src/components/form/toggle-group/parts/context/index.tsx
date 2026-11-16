import { createContext, useContext } from 'react';
import type { ToggleSize, ToggleVariant } from '@/components/form/toggle';

export type ToggleGroupContextValue = {
	variant: ToggleVariant;
	size: ToggleSize;
};

/** The tier and the scale, which every item of a group shares unless it overrides one. */
export const ToggleGroupContext = createContext<ToggleGroupContextValue>({
	variant: 'ghost',
	size: 'md',
});

export function useToggleGroup() {
	return useContext(ToggleGroupContext);
}
