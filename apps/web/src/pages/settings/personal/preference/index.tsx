import { PAGE_SIZE_OPTIONS } from '@lumo/shared';
import { Page, Select, SettingsGroup, type SelectOption } from '@/components';
import { themes, type Theme } from '@/hooks';
import { useSetting } from '@/providers/setting';
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

const sizeOptions: SelectOption<string>[] = PAGE_SIZE_OPTIONS.map((size) => ({
	value: String(size),
	label: `${size} / page`,
}));

export const PreferenceSetting = () => {
	const { theme, setTheme } = useTheme();
	const { content, save, saving, failed } = useSetting();

	return (
		<Page variant="settings" title="Preference">
			<SettingsGroup
				title="General"
				items={[
					{
						title: 'Theme',
						description: 'Choose a color scheme or follow your system setting.',
						content: (
							<Select
								ariaLabel="Theme"
								options={themeOptions}
								value={theme}
								onChange={(next) => {
									if (next !== null) setTheme(next);
								}}
								size="sm"
							/>
						),
					},
					{
						title: 'Rows per page',
						description: 'How many rows a list opens with.',
						content: (
							<Select
								ariaLabel="Rows per page"
								options={sizeOptions}
								value={String(content.pageSize)}
								loading={saving}
								invalid={failed('pageSize')}
								onChange={(next) => {
									if (next !== null) void save({ pageSize: Number(next) });
								}}
								size="sm"
							/>
						),
					},
				]}
			/>
		</Page>
	);
};
