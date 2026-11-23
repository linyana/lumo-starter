import { createContext, useContext } from 'react';
import type { StepStatus } from '../item';
import type { StepsVariant } from '../root';

export type StepsOrientation = 'horizontal' | 'vertical';

export type StepsSize = 'sm' | 'md';

type StepsContextValue = {
	current?: number;
	orientation: StepsOrientation;
	size: StepsSize;
	variant: StepsVariant;
};

export const StepsContext = createContext<StepsContextValue>({
	orientation: 'horizontal',
	size: 'md',
	variant: 'numbered',
});

export const StepIndexContext = createContext<number | undefined>(undefined);

export const StepStatusContext = createContext<StepStatus | undefined>(undefined);

export function useSteps() {
	return useContext(StepsContext);
}
