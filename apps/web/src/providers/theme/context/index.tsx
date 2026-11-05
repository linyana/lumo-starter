import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import type { Theme, ThemeContextValue, ThemeProviderProps } from '../types';

/**
 * Where the choice is remembered. `index.html` reads the same key before the first paint, so the
 * two readers have to keep agreeing on it and on what counts as `dark`.
 */
const key = 'lumo-theme';
const fallback: Theme = 'light';

/** Storage can be unavailable (private mode, quota) or hold junk, so the read is total. */
const read = (): Theme => {
	try {
		return localStorage.getItem(key) === 'dark' ? 'dark' : fallback;
	} catch {
		return fallback;
	}
};

/** A preference we cannot remember is still one we can honour for this visit. */
const write = (theme: Theme) => {
	try {
		localStorage.setItem(key, theme);
	} catch {
		// Nothing to do: the document is already themed, the next visit just starts at the default.
	}
};

/**
 * `.dark` on <html> is how the stylesheet picks its token block — see `@custom-variant dark` in
 * `index.css`. `colorScheme` carries the choice to the native chrome: scrollbars and form controls
 * would otherwise follow the operating system instead.
 */
const apply = (theme: Theme) => {
	document.documentElement.classList.toggle('dark', theme === 'dark');
	document.documentElement.style.colorScheme = theme;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * The theme is a provider rather than a field of `hooks/use-global` because it is not ours to own:
 * it lives on the document and in storage, and this is the one place that keeps the two in step.
 * Everything else the app remembers is data, and stays in the store.
 *
 * First paint is not this component's job — `index.html` sets the class before React runs. The
 * layout effect re-applies the same value, idempotently, and covers every change after that.
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
	const [theme, setThemeState] = useState<Theme>(read);

	useLayoutEffect(() => apply(theme), [theme]);

	const setTheme = useCallback((next: Theme) => {
		setThemeState(next);
		write(next);
	}, []);

	const toggle = useCallback(
		() => setTheme(theme === 'dark' ? 'light' : 'dark'),
		[setTheme, theme],
	);

	const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, setTheme, toggle]);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
	const value = useContext(ThemeContext);
	if (!value) throw new Error('useTheme must be used inside ThemeProvider');
	return value;
};
