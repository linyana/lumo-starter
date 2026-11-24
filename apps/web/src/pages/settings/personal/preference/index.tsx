import { Page, Select, SettingsGroup, type SelectOption } from '@/components';
import { themes, type Theme } from '@/hooks';
import { useTheme } from '@/providers/theme';

const labels: Record<Theme, string> = {
	light: 'Light',
	dark: 'Dark',
	system: 'System',
};

const themeOptions: SelectOption<Theme>[] = themes.map((value) => ({
	value,
	label: labels[value],
}));

export const PreferenceSetting = () => {
	const { theme, setTheme } = useTheme();

	return (
		<Page variant="settings" title="Preference">
			<SettingsGroup
				title="General"
				items={[
					{
						title: 'Theme',
						description: 'Choose a color scheme or follow your system setting.',
						content: (
							<Select<Theme>
								ariaLabel="Theme"
								options={themeOptions}
								value={theme}
								onChange={(next) => {
									if (next !== null) setTheme(next);
								}}
								clearable={false}
								size="sm"
							/>
						),
					},
				]}
			/>
		</Page>
	);
};
