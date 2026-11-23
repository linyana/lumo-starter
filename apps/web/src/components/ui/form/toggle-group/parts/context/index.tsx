import { createContext, useContext } from 'react';
import type { ToggleSize, ToggleVariant } from '@/components/ui/form/toggle';

export type ToggleGroupContextValue = {
	variant: ToggleVariant;
	size: ToggleSize;
};

export const ToggleGroupContext = createContext<ToggleGroupContextValue>({
	variant: 'ghost',
	size: 'md',
});

export function useToggleGroup() {
	return useContext(ToggleGroupContext);
}
