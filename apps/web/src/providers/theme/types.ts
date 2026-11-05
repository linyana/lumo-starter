import type { ReactNode } from 'react';

export type Theme = 'light' | 'dark';

/** What a consumer reads: the current choice and the two ways to change it. */
export type ThemeContextValue = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggle: () => void;
};

export type ThemeProviderProps = { children: ReactNode };
