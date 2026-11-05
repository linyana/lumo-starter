import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGlobal } from '@/hooks';

export const ThemeToggle = () => {
	const theme = useGlobal((state) => state.theme);
	const actions = useGlobal((state) => state.actions);
	const dark = theme === 'dark';

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
			aria-pressed={dark}
			icon={dark ? <Sun /> : <Moon />}
			onClick={() => actions.set({ theme: dark ? 'light' : 'dark' })}
		/>
	);
};
