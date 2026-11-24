import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components';
import { useTheme } from '../use-theme';

export const ThemeToggle = () => {
	const { resolved, setTheme } = useTheme();
	const dark = resolved === 'dark';

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon-sm"
			aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
			aria-pressed={dark}
			icon={dark ? <Sun /> : <Moon />}
			onClick={() => setTheme(dark ? 'light' : 'dark')}
		/>
	);
};
