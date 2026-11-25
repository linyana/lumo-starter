import { updateProfileSchema } from '@lumo/shared';
import { Avatar, Field, Form, Input, Page, SettingsGroup, useForm } from '@/components';
import { useHttp } from '@/hooks';
import { useAuth } from '@/providers/auth';

export const ProfileSetting = () => {
	const { user, updateProfile } = useAuth();
	const form = useForm();

	const autosave = useHttp({ endpoint: updateProfile, successMessage: 'Profile saved', form });

	if (user === null) return null;

	return (
		<Page variant="settings" title="Profile">
			<Form
				form={form}
				schema={updateProfileSchema}
				initial={{ username: user.username, email: user.email, name: user.name }}
				autosave={autosave}
			>
				<SettingsGroup
					title="Account"
					items={[
						{
							title: 'Avatar',
							description: 'Drawn from your display name. It cannot be changed.',
							width: 'auto',
							content: <Avatar alt={user.name} size="lg" />,
						},
						{
							title: 'Username',
							description: '3–32 characters: lowercase letters, numbers and underscores.',
							width: 'wide',
							content: (
								<Field name="username">
									<Input autoComplete="username" autoCapitalize="none" spellCheck={false} />
								</Field>
							),
						},
						{
							title: 'Email',
							description: 'The address you sign in with.',
							width: 'wide',
							content: (
								<Field name="email">
									<Input type="email" autoComplete="email" />
								</Field>
							),
						},
						{
							title: 'Display name',
							description: 'Shown to other people in this workspace.',
							width: 'wide',
							content: (
								<Field name="name">
									<Input autoComplete="name" />
								</Field>
							),
						},
					]}
				/>
			</Form>
		</Page>
	);
};
