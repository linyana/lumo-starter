import { createContext, useContext } from 'react';
import type { StepStatus } from '../item';
import type { StepsVariant } from '../root';

export type StepsOrientation = 'horizontal' | 'vertical';

export type StepsSize = 'sm' | 'md';

type StepsContextValue = {
	/** The item that is happening now. Without one every item rests as `wait`. */
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

export /** `StepsRoot` hands each direct child its position, so an item never has to state its own index. */
const StepIndexContext = createContext<number | undefined>(undefined);

export /**
 * The status of the item a part is drawn in. `StepsItem` also writes it to the DOM, where a part whose
 * look is a CSS rule can read it; a part whose look is a variant — the circle, the connector —
 * reads it here instead, so neither has to be handed a status it could have found out.
 */
const StepStatusContext = createContext<StepStatus | undefined>(undefined);

export function useSteps() {
	return useContext(StepsContext);
}
