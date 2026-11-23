import { createContext, useContext } from 'react';
import type { TabsValue } from '../panels';
import type { TabsSize, TabsVariant } from '../root';

export type TabsContextValue = {
	variant: TabsVariant;
	size: TabsSize;
};

export const TabsContext = createContext<TabsContextValue>({
	variant: 'rounded',
	size: 'md',
});

export const ActiveContext = createContext<TabsValue | undefined>(undefined);

export const TrackContext = createContext(false);

export function useTabs() {
	return useContext(TabsContext);
}
