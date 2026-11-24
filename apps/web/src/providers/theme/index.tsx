import { useLayoutEffect, type ReactNode } from 'react';
import { useTheme } from './use-theme';

export { ThemeToggle } from './theme-toggle';
export { useTheme } from './use-theme';

type IPropsType = { children: ReactNode };

export const ThemeProvider = ({ children }: IPropsType) => {
	const { resolved } = useTheme();

	useLayoutEffect(() => {
		document.documentElement.classList.toggle('dark', resolved === 'dark');
		document.documentElement.style.colorScheme = resolved;
	}, [resolved]);

	return children;
};
