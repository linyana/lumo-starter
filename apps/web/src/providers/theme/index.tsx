import { useLayoutEffect, type ReactNode } from 'react';
import { useGlobal } from '@/hooks';

export { ThemeToggle } from './theme-toggle';

type IPropsType = { children: ReactNode };

export const ThemeProvider = ({ children }: IPropsType) => {
	const theme = useGlobal((state) => state.theme);

	useLayoutEffect(() => {
		document.documentElement.classList.toggle('dark', theme === 'dark');
		document.documentElement.style.colorScheme = theme;
	}, [theme]);

	return children;
};
