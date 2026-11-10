import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components';
import { useGlobal } from '@/hooks';

/**
 * The one control for the theme: both frames — the rail's brand row and the anonymous screens'
 * header — draw this, so neither owns the behaviour. It writes the store field; the document
 * follows in `providers/theme`.
 */
export const ThemeToggle = () => {
	const theme = useGlobal((state) => state.theme);
	const set = useGlobal((state) => state.actions.set);
	const dark = theme === 'dark';

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
			aria-pressed={dark}
			icon={dark ? <Sun /> : <Moon />}
			onClick={() => set({ theme: dark ? 'light' : 'dark' })}
		/>
	);
};
