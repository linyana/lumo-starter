import { PAGE_SIZE_OPTIONS, userSettingContentSchema } from '@lumo/shared';
import { Field, Form, Select, SettingsGroup, useForm, type SelectOption } from '@/components';
import { themes, useHttp, type Theme } from '@/hooks';
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

const sizeOptions: SelectOption<number>[] = PAGE_SIZE_OPTIONS.map((size) => ({
	value: size,
	label: `${size} / page`,
}));

export const PreferenceSection = () => {
	const { theme, setTheme } = useTheme();
	const { settings, update } = useSetting();
	const form = useForm();

	const autosave = useHttp({ endpoint: update, successMessage: 'Preference saved', form });

	return (
		<Form
			form={form}
			schema={userSettingContentSchema}
			initial={settings}
			autosave={autosave}
			commitOn="change"
		>
			<SettingsGroup
				title="Preference"
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
							<Field name="pageSize">
								<Select ariaLabel="Rows per page" options={sizeOptions} size="sm" />
							</Field>
						),
					},
				]}
			/>
		</Form>
	);
};
