import { updateProfileSchema } from '@lumo/shared';
import { Avatar, Field, Form, Input, SettingsGroup, useForm } from '@/components';
import { useHttp } from '@/hooks';
import { useAuth } from '@/providers/auth';

export const ProfileSection = () => {
	const { user, updateProfile } = useAuth();
	const form = useForm();

	const autosave = useHttp({ endpoint: updateProfile, successMessage: 'Profile saved', form });

	if (user === null) return null;

	return (
		<Form
			form={form}
			schema={updateProfileSchema}
			initial={{ username: user.username, email: user.email }}
			autosave={autosave}
		>
			<SettingsGroup
				title="Profile"
				items={[
					{
						title: 'Avatar',
						description: 'Drawn from your username. It cannot be changed.',
						width: 'auto',
						content: <Avatar alt={user.username} size="lg" />,
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
				]}
			/>
		</Form>
	);
};
