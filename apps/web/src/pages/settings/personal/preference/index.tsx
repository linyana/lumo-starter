import { Page, SettingsGroup } from '@/components';

export const PreferenceSetting = () => {
	return (
		<Page variant="settings" title="Preference">
			<SettingsGroup
				title="General"
				items={[
					{
						title: 'Theme',
						description: 'select your interface color scheme',
						content: <>1</>,
					},
					{
						title: 'xx',
						description: 'xx',
						content: <>1</>,
					},
				]}
			/>
		</Page>
	);
};
