import { createContext, useContext } from 'react';
import type { TabsValue } from '../panels';
import type { TabsSize, TabsVariant } from '../root';

export type TabsContextValue = {
	variant: TabsVariant;
	size: TabsSize;
};

/** The look, which almost every part reads — and which no tab change can alter. */
export const TabsContext = createContext<TabsContextValue>({
	variant: 'rounded',
	size: 'md',
});

export /**
 * The tab on screen. Its own context, and deliberately a small one: a change of tab re-renders
 * whatever reads this and nothing else, so a panel's contents — which the DOM already says are the
 * ones on screen — are not rebuilt every time somebody clicks a tab.
 */
const ActiveContext = createContext<TabsValue | undefined>(undefined);

export /** Whether a `TabsPanel` is inside `TabsPanels`, where it is one lane of a track rather than a stack. */
const TrackContext = createContext(false);

/** The variant and size set on `TabsRoot`, which every part inherits unless it overrides one. */
export function useTabs() {
	return useContext(TabsContext);
}
