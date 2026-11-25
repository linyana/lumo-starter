import { registerSchema } from '@lumo/shared';
import { Link, useNavigate } from 'react-router';
import { Button, Field, Form, Input } from '@/components';
import { useHttp } from '@/hooks';
import { useAuth } from '@/providers/auth';
import { AuthLayout } from '@/providers/layout';

export const RegisterPage = () => {
	const { register } = useAuth();
	const navigate = useNavigate();

	const submit = useHttp({
		endpoint: register,
		onSuccess: () => navigate('/', { replace: true }),
	});

	return (
		<AuthLayout
			title="Create account"
			description="You get a workspace of your own. Its URL is what you share with the people you invite."
			footer={
				<>
					Already have an account?{' '}
					<Button
						variant="link"
						className="h-auto p-0"
						nativeButton={false}
						render={<Link to="/login" />}
					>
						Sign in now
					</Button>
				</>
			}
		>
			<Form schema={registerSchema} onSubmit={submit.fetchData}>
				<Field
					name="username"
					label="Username"
					description="3–32 characters: lowercase letters, numbers and underscores."
				>
					<Input autoComplete="username" autoCapitalize="none" spellCheck={false} />
				</Field>

				<Field name="email" label="Email">
					<Input type="email" autoComplete="email" />
				</Field>

				<Field
					name="workspaceSlug"
					label="Workspace URL"
					description="Lowercase letters, numbers and hyphens. This cannot be changed later."
				>
					<Input autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="acme" />
				</Field>

				<Field
					name="password"
					label="Password"
					description="At least 8 characters, mixing letters and numbers."
				>
					<Input type="password" autoComplete="new-password" />
				</Field>

				<Field name="confirmPassword" label="Confirm password">
					<Input type="password" autoComplete="new-password" />
				</Field>

				<Button type="submit" loading={submit.loading} className="mt-2 w-full">
					Create account
				</Button>
			</Form>
		</AuthLayout>
	);
};
