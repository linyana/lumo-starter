import { useCallback } from 'react';
import { useGlobal, type Theme } from '@/hooks';
import { useResolvedTheme } from '../use-resolved-theme';

export const useTheme = () => {
	const theme = useGlobal((state) => state.theme);
	const set = useGlobal((state) => state.actions.set);

	const resolved = useResolvedTheme(theme);
	const setTheme = useCallback((next: Theme) => set({ theme: next }), [set]);

	return { theme, resolved, setTheme };
};
