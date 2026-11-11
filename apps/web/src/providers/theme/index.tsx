import type { ReactNode } from 'react';
import { useLayoutEffect } from 'react';
import { useGlobal } from '@/hooks';

export { ThemeToggle } from './theme-toggle';

type IPropsType = { children: ReactNode };

/**
 * The theme itself is data and lives in `hooks/use-global`; this component is the only place that
 * mirrors it onto the document, so no module import can move the class list as a side effect.
 *
 * `.dark` on <html> is how the stylesheet picks its token block — see `@custom-variant dark` in
 * `index.css`. `colorScheme` carries the choice to the native chrome: scrollbars and form controls
 * would otherwise follow the operating system instead.
 *
 * A layout effect, not an effect: a toggle has to be in the class list before the frame it causes is
 * painted, or the old theme shows for one frame. The first paint is not this component's job —
 * `index.html` sets the class before React runs, and this repeats the same value, idempotently.
 */
export const ThemeProvider = ({ children }: IPropsType) => {
	const theme = useGlobal((state) => state.theme);

	useLayoutEffect(() => {
		document.documentElement.classList.toggle('dark', theme === 'dark');
		document.documentElement.style.colorScheme = theme;
	}, [theme]);

	return children;
};
