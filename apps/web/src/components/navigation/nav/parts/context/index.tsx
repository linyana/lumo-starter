import { createContext, useContext } from 'react';

export type NavContextValue = {
	compact: boolean;
};

export const NavContext = createContext<NavContextValue>({ compact: false });

export function useNav() {
	return useContext(NavContext);
}
