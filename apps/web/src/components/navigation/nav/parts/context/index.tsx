import { createContext, useContext } from 'react';

export type NavContextValue = {
	/** The rail: rows keep one glyph, and a row with children opens them in a popover. */
	compact: boolean;
};

export const NavContext = createContext<NavContextValue>({ compact: false });

export function useNav() {
	return useContext(NavContext);
}
