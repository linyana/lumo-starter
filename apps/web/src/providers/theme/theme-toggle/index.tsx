import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '../context';

/**
 * The one control for the theme: both frames — the rail's brand row and the anonymous screens'
 * header — draw this, so neither owns the behaviour.
 */
export const ThemeToggle = () => {
	const { theme, toggle } = useTheme();
	const dark = theme === 'dark';

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
			aria-pressed={dark}
			icon={dark ? <Sun /> : <Moon />}
			onClick={toggle}
		/>
	);
};
