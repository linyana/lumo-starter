import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components';
import { useGlobal } from '@/hooks';

export const ThemeToggle = () => {
	const theme = useGlobal((state) => state.theme);
	const set = useGlobal((state) => state.actions.set);
	const dark = theme === 'dark';

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon-sm"
			aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
			aria-pressed={dark}
			icon={dark ? <Sun /> : <Moon />}
			onClick={() => set({ theme: dark ? 'light' : 'dark' })}
		/>
	);
};
