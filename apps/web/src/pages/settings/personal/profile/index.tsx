import { updateProfileSchema } from '@lumo/shared';
import { Avatar, Field, Form, Input, Page, SettingsGroup, useForm } from '@/components';
import { useAutoSave } from '@/hooks';
import { useAuth } from '@/providers/auth';

export const ProfileSetting = () => {
	const { user, updateProfile } = useAuth();
	const form = useForm();

	const { saved, blur, enter, busy } = useAutoSave({
		form,
		schema: updateProfileSchema,
		initial: {
			username: user?.username ?? '',
			email: user?.email ?? '',
			name: user?.name ?? '',
		},
		endpoint: updateProfile,
		successMessage: 'Profile saved',
	});

	if (user === null) return null;

	return (
		<Page variant="settings" title="Profile">
			<Form form={form} schema={updateProfileSchema} initial={saved}>
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
									<Input
										autoComplete="username"
										autoCapitalize="none"
										spellCheck={false}
										loading={busy('username')}
										onBlur={blur('username')}
										onKeyDown={enter('username')}
									/>
								</Field>
							),
						},
						{
							title: 'Email',
							description: 'The address you sign in with.',
							width: 'wide',
							content: (
								<Field name="email">
									<Input
										type="email"
										autoComplete="email"
										loading={busy('email')}
										onBlur={blur('email')}
										onKeyDown={enter('email')}
									/>
								</Field>
							),
						},
						{
							title: 'Display name',
							description: 'Shown to other people in this workspace.',
							width: 'wide',
							content: (
								<Field name="name">
									<Input
										autoComplete="name"
										loading={busy('name')}
										onBlur={blur('name')}
										onKeyDown={enter('name')}
									/>
								</Field>
							),
						},
					]}
				/>
			</Form>
		</Page>
	);
};
