import { useSyncExternalStore } from 'react';
import { defaultTheme, type ResolvedTheme, type Theme } from '@/hooks';

const darkScheme = '(prefers-color-scheme: dark)';

const resolve = ({ theme, system }: { theme: Theme; system: ResolvedTheme }): ResolvedTheme =>
	theme === 'system' ? system : theme;

let query: MediaQueryList | undefined;

const getQuery = (): MediaQueryList => (query ??= window.matchMedia(darkScheme));

const subscribe = (onChange: () => void) => {
	const media = getQuery();
	media.addEventListener('change', onChange);
	return () => media.removeEventListener('change', onChange);
};

const getSystemTheme = (): ResolvedTheme => (getQuery().matches ? 'dark' : 'light');

const getServerTheme = (): ResolvedTheme => resolve({ theme: defaultTheme, system: 'light' });

export const useResolvedTheme = (theme: Theme): ResolvedTheme => {
	const system = useSyncExternalStore(subscribe, getSystemTheme, getServerTheme);

	return resolve({ theme, system });
};
