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
			description="The first account becomes the owner; later ones join as members."
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
				<Field name="email" label="Email">
					<Input type="email" autoComplete="email" />
				</Field>

				<Field name="name" label="Display name">
					<Input autoComplete="name" />
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
